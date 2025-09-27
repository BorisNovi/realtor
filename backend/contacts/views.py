from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from typing import Optional
from contacts.models import Contact
from contacts.serializers import ContactSerializer

from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.db.models import QuerySet

class ContactView(APIView):
    def get(self, request: Request, pk: Optional[int] = None) -> Response:
        if pk is not None:
            # Получаем конкретный контакт по id
            try:
                contact = Contact.objects.get(pk=pk)
            except Contact.DoesNotExist:
                return Response({"detail": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)
            serializer = ContactSerializer(contact)
            return Response(serializer.data)

        # Если pk не передан — список контактов
        search: Optional[str] = request.query_params.get("search")
        first: int = int(request.query_params.get("first", 0))
        rows: int = int(request.query_params.get("rows", 10))

        # Получаем объект сортировки от фронта
        sort_field: Optional[str] = request.query_params.get("sortField")
        sort_order: str = request.query_params.get("sortOrder", "asc")  # по умолчанию asc

        queryset = Contact.objects.all()

        # Полнотекстовый поиск
        if search:
            query = SearchQuery(search)
            queryset = (
                queryset
                .annotate(search=SearchVector("name", "phone"))
                .filter(search=query)
                .annotate(rank=SearchRank(SearchVector("name", "phone"), query))
                .order_by("-rank")  # релевантные первыми
            )

        # Сортировка по фронту
        if sort_field in ["name", "dateAdded"]:
            if sort_order.lower() == "desc":
                queryset = queryset.order_by(f"-{sort_field}")
            else:
                queryset = queryset.order_by(sort_field)

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

    def delete(self, request, pk):
        try:
            contact = Contact.objects.get(pk=pk)
        except Contact.DoesNotExist:
            return Response({"detail": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)
        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
