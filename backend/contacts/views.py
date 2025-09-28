from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from typing import Optional

from contacts.models import Contact
from contacts.serializers import ContactSerializer
import re
from typing import Optional
from django.db.models import Q

from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.db.models import QuerySet

from typing import Optional, List # Для пакетного удаления


class ContactView(APIView):
    def _build_prefix_tsquery(self, text: str) -> SearchQuery:
        """
        Собирает безопасный raw tsquery с префиксами: токен -> token:*
        Пример: "анаст на" -> "анаст:* & на:*"
        Убирает небуквенно-цифровые символы (чтобы не поломать raw tsquery).
        """
        tokens = re.findall(r'\w+', text, flags=re.UNICODE)
        if not tokens:
            # fallback на обычный plainto_tsquery
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

    def delete(self, request: Request, pk: Optional[int] = None) -> Response:
        ids_param: Optional[str] = request.query_params.get("ids")
        deleted_count: int = 0

        # Удаление пачкой
        if ids_param:
            try:
                ids: List[int] = [int(x) for x in ids_param.split(",") if x.strip().isdigit()]
            except ValueError:
                return Response({"detail": "Invalid ids parameter."}, status=status.HTTP_400_BAD_REQUEST)

            if not ids:
                return Response({"detail": "No valid ids provided."}, status=status.HTTP_400_BAD_REQUEST)

            qs = Contact.objects.filter(pk__in=ids)
            deleted_count = qs.count()
            qs.delete()
            return Response({"deleted": deleted_count}, status=status.HTTP_200_OK)

        # Удаление по pk (одиночный режим)
        if pk is not None:
            try:
                contact = Contact.objects.get(pk=pk)
            except Contact.DoesNotExist:
                return Response({"detail": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)
            contact.delete()
            deleted_count = 1
            return Response({"deleted": deleted_count}, status=status.HTTP_200_OK)

        return Response(
            {"detail": "Specify either pk in URL or ids query param."},
            status=status.HTTP_400_BAD_REQUEST
        )

