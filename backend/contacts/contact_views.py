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
    

    def _build_prefix_tsquery(self, text: str) -> Optional[SearchQuery]:
        """
        Строим prefix tsquery вида: token:* & token2:*
        Если токенов нет — возвращаем None.
        """
        tokens = re.findall(r"\w+", text, flags=re.UNICODE)
        if not tokens:
            return None

        raw_query = " & ".join(f"{token}:*" for token in tokens)
        return SearchQuery(raw_query, search_type="raw")


    def get(self, request, pk: Optional[int] = None):

        # -------- Получение одного контакта --------
        if pk is not None:
            contact = Contact.objects.filter(pk=pk).first()
            if not contact:
                return Response(
                    {"detail": "Contact not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(ContactSerializer(contact).data)

        # -------- Параметры --------
        search = request.query_params.get("search")
        sort_field = request.query_params.get("sortField")
        sort_order = request.query_params.get("sortOrder", "asc")

        try:
            first = int(request.query_params.get("first", 0))
            rows = int(request.query_params.get("rows", 10))
        except ValueError:
            return Response(
                {"detail": "Invalid pagination params."},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = Contact.objects.all()

        # -------- Поиск --------
        if search and search.strip():

            tsquery = self._build_prefix_tsquery(search)

            if tsquery:
                vector = SearchVector("name", "phone")

                fts_queryset = (
                    queryset
                    .annotate(search_vector=vector)
                    .filter(search_vector=tsquery)
                    .annotate(rank=SearchRank(vector, tsquery))
                    .order_by("-rank")
                )

                # Проверяем наличие результатов без отдельнего exists()
                first_result = fts_queryset[:1]
                if first_result:
                    queryset = fts_queryset
                else:
                    queryset = queryset.filter(
                        Q(name__icontains=search) |
                        Q(phone__icontains=search)
                    )
            else:
                queryset = queryset.filter(
                    Q(name__icontains=search) |
                    Q(phone__icontains=search)
                )

        # -------- Сортировка --------
        allowed_sort_fields = ["name", "dateAdded"]

        if sort_field in allowed_sort_fields:
            direction = "-" if sort_order.lower() == "desc" else ""
            queryset = queryset.order_by(f"{direction}{sort_field}")
        elif not search:
            # Дефолтная сортировка только если нет fulltext
            queryset = queryset.order_by("-dateAdded")

        # -------- Пагинация --------
        total_count = queryset.count()
        paginated_queryset = queryset[first:first + rows]

        serializer = ContactSerializer(paginated_queryset, many=True)

        return Response({
            "items": serializer.data,
            "total": total_count
        })


    def post(self, request):
        serializer = ContactSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        contact = serializer.save()

        return Response(
            ContactSerializer(contact).data,
            status=status.HTTP_201_CREATED
        )


    def put(self, request, pk):

        contact = Contact.objects.filter(pk=pk).first()
        if not contact:
            return Response(
                {"detail": "Contact not found."},
                status=404
            )

        serializer = ContactSerializer(
            contact,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        contact = serializer.save()
        return Response(ContactSerializer(contact).data)

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
