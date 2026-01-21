# contacts/views.py
import json
import re
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from contacts.models import Contact
from django.db.models import Q
from contacts.contact_serializers import ContactSerializer
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from typing import Optional, List # Для пакетного удаления

# Контроллер для контактов с поддержкой поиска, пагинации, сортировки и CRUD операций
# Использует PostgreSQL full-text search с префиксным поиском и fallback на icontains
class ContactView(APIView):
    # authentication_classes = [JWTAuthentication]  
    # permission_classes = [permissions.IsAuthenticated]
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    

    def _build_prefix_tsquery(self, text: str) -> SearchQuery:
        """Строит префиксный tsquery из входного текста для full-text поиска.
        Разбивает текст на токены и формирует запрос с использованием :* для префиксного поиска."""
        
        tokens = re.findall(r'\w+', text, flags=re.UNICODE)
        if not tokens:
            return SearchQuery(text)
        raw = ' & '.join(f"{token}:*" for token in tokens)
        return SearchQuery(raw, search_type='raw')

    def get(self, request: Request, pk: Optional[int] = None) -> Response:
        if pk is not None:
            try:
                contact = Contact.objects.get(pk=pk)
            except Contact.DoesNotExist:
                return Response({"detail": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)
            serializer = ContactSerializer(contact)
            return Response(serializer.data)

        # Список (search, pagination, sorting)
        search: Optional[str] = request.query_params.get("search")
        first: int = int(request.query_params.get("first", 0))
        rows: int = int(request.query_params.get("rows", 10))
        sort_field: Optional[str] = request.query_params.get("sortField")
        sort_order: str = request.query_params.get("sortOrder", "asc")

        queryset = Contact.objects.all()

        if search:
            # Попробуем prefix-fulltext (tsquery с :*)
            tsquery = self._build_prefix_tsquery(search)
            vector = SearchVector("name", "phone")
            fts_qs = (
                queryset
                .annotate(search_vector=vector)
                .filter(search_vector=tsquery)  # фильтр по tsquery
                .annotate(rank=SearchRank(vector, tsquery))
                .order_by("-rank")
            )

            # если fulltext ничего не вернуло — fallback на substring (icontains)
            if fts_qs.exists():
                queryset = fts_qs
            else:
                queryset = queryset.filter(
                    Q(name__icontains=search) | Q(phone__icontains=search)
                )
        # если search не указан — queryset остаётся all()

        # Сортировка (если указана фронтом — она перекрывает order_by("-rank"))
        if sort_field in ["name", "dateAdded"]:
            direction = "-" if sort_order.lower() == "desc" else ""
            queryset = queryset.order_by(f"{direction}{sort_field}")
        else:
            # Дефолтная сортировка по дате добавления (по убыванию)
            queryset = queryset.order_by("-dateAdded") 

        total_count: int = queryset.count()
        paginated_queryset = queryset[first:first + rows]
        
        serializer = ContactSerializer(paginated_queryset, many=True)

        return Response({
            "items": serializer.data,
            "total": total_count
        })

    def post(self, request):
        serializer = ContactSerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.save()
            return Response(ContactSerializer(contact).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            contact = Contact.objects.get(pk=pk)
        except Contact.DoesNotExist:
            return Response({"detail": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ContactSerializer(contact, data=request.data, partial=True)
        if serializer.is_valid():
            contact = serializer.save()
            return Response(ContactSerializer(contact).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Удаление контактов (пакетное) 
    # Ожидает JSON-массив ID в поле "ids" тела запроса
    def delete(self, request):
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
