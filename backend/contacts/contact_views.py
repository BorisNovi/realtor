# contacts/views.py
import re, json
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from catalog.utils.pagination import FrontendPagination
from contacts.models import Contact
from django.db.models import Q
from contacts.contact_serializers import ContactSerializer
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from typing import Optional
from rest_framework import viewsets
from realtor import mixins
from rest_framework.decorators import action
from realtor.helpers import build_prefix_tsquery

# Контроллер для контактов с поддержкой поиска, пагинации, сортировки и CRUD операций
# Использует PostgreSQL full-text search с префиксным поиском и fallback на icontains
class ContactView(mixins.CurrentUserQuerysetMixin, viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]  
    serializer_class = ContactSerializer 
    pagination_class = FrontendPagination #TODO: Убедись, что нужна именно кастомная пагинация
    queryset = Contact.objects.all()

    def _build_prefix(self, text: str) -> Optional[SearchQuery]:
        return build_prefix_tsquery(text)
        
    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get("search")
        sort_field = self.request.query_params.get("sortField")
        sort_order = self.request.query_params.get("sortOrder", "asc")

        # --- Поиск ---
        if search and search.strip():
            tsquery = self._build_prefix_tsquery(search)
            if tsquery:
                vector = SearchVector("name", "phone")
                fts_qs = (
                    qs.annotate(search_vector=vector)
                    .filter(search_vector=tsquery)
                    .annotate(rank=SearchRank(vector, tsquery))
                    .order_by("-rank")
                )
                qs = fts_qs if fts_qs.exists() else qs.filter(
                    Q(name__icontains=search) | Q(phone__icontains=search)
                )
            else:
                qs = qs.filter(Q(name__icontains=search) | Q(phone__icontains=search))

        # --- Сортировка ---
        allowed_sort_fields = ["name", "dateAdded"]
        if sort_field in allowed_sort_fields:
            direction = "-" if sort_order.lower() == "desc" else ""
            qs = qs.order_by(f"{direction}{sort_field}")
        elif not search:
            qs = qs.order_by("-dateAdded")

        return qs

    # Удаление контактов (пакетное) 
    # Ожидает JSON-массив ID в поле "ids" тела запроса
    @action(detail=False, methods=["delete"])
    def bulk_delete(self, request):
        ids_param = request.query_params.get("ids", "[]")
        try:
            ids = json.loads(ids_param)
        except json.JSONDecodeError:
            return Response({"detail": "Invalid JSON"}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(ids, list):
            return Response({"detail": "Invalid ID list"}, status=status.HTTP_400_BAD_REQUEST)

        qs = Contact.objects.filter(id__in=ids)
        deleted_count = qs.count()
        qs.delete()
        return Response({"deleted": deleted_count}, status=status.HTTP_200_OK)
