import json
from typing import Optional
from rest_framework import status, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.db.models import Q
from django.shortcuts import get_object_or_404
from realtor import mixins
from realtor.helpers import build_prefix_tsquery
from catalog.utils.pagination import FrontendPagination
from listings.models import Listing
from listings.listing_serializers import ListingSerializer

class ListingsView(mixins.CurrentUserQuerysetMixin, viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    queryset = Listing.objects.all()  
    pagination_class = FrontendPagination
    serializer_class = ListingSerializer

    def _build_prefix(self, text: str) -> Optional[SearchQuery]:
        return build_prefix_tsquery(text)
    
    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get("search")
        sort_field = self.request.query_params.get("sortField")
        sort_order = self.request.query_params.get("sortOrder", "asc")

        if search and search.strip():
            tsquery = self._build_prefix(search)
            if tsquery:
                vector = SearchVector("name")
                fts_qs = (
                    qs.annotate(search_vector=vector)
                    .filter(search_vector=tsquery)
                    .annotate(rank=SearchRank(vector, tsquery))
                    .order_by("-rank")
                )
                qs = fts_qs if fts_qs.exists() else qs.filter(
                    Q(name__icontains=search)
                )
            else:
                qs = qs.filter(Q(name__icontains=search))

        allowed_sort_fields = ["name", "date_added"]

        # Нормализация. TODO: то же самое нужно сделать для контаков, 
        # предварительно переименовав модель на питоновский лад. 
        if sort_field == "dateAdded":
            sort_field = "date_added"

        if sort_field in allowed_sort_fields:
            direction = "-" if sort_order.lower() == "desc" else ""
            qs = qs.order_by(f"{direction}{sort_field}")
        elif not search:
            qs = qs.order_by("-date_added")

        return qs

    @action(detail=False, methods=["delete"])
    def bulk_delete(self, request):
        ids_param = request.query_params.get("ids", "[]")
        try:
            ids = json.loads(ids_param)
        except json.JSONDecodeError:
            return Response({"detail": "Invalid JSON"}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(ids, list):
            return Response({"detail": "Invalid ID list"}, status=status.HTTP_400_BAD_REQUEST)

        qs = Listing.objects.filter(id__in=ids)
        deleted_count = qs.count()
        qs.delete()
        return Response({"deleted": deleted_count}, status=status.HTTP_200_OK)


# Удаление контакта перед отправкой публичной подборки
def remove_contacts(obj):
    """Рекурсивно удаляет поле "contact" из вложенных структур данных. 
    Применяется перед отправкой публичной подборки клиенту."""
    if isinstance(obj, dict):
        obj.pop("contact", None) 
        for value in obj.values():
            remove_contacts(value)  
    elif isinstance(obj, list):
        for item in obj:
            remove_contacts(item) 

# публичный контроллер для получения одного листинга по токену
class PublicListingView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request, token: str):
        listing = get_object_or_404(Listing, public_link__token=token)
        
        if not listing.public_link.get("available", False):
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ListingSerializer(listing)
        data = serializer.data

        remove_contacts(data)

        return Response(data, status=status.HTTP_200_OK)

