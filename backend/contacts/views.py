from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from contacts.models import Contact
from contacts.serializers import ContactSerializer

from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank


class ContactView(APIView):
    def get(self, request, pk=None):
        if pk:
            # Получаем конкретный контакт по id
            try:
                contact = Contact.objects.get(pk=pk)
            except Contact.DoesNotExist:
                return Response({"detail": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)
            serializer = ContactSerializer(contact)
            return Response(serializer.data)

        # Если pk не передан — список контактов
        search = request.query_params.get("search")
        first = int(request.query_params.get("first", 0))  # индекс первого элемента, по умолчанию 0
        rows = int(request.query_params.get("rows", 10))   # количество элементов на странице, по умолчанию 10

        queryset = Contact.objects.all()

        if search:
            query = SearchQuery(search)
            queryset = (
                queryset
                .annotate(search=SearchVector("name", "phone"))
                .filter(search=query)
                .annotate(rank=SearchRank(SearchVector("name", "phone"), query))
                .order_by("-rank")
            )

        total_count = queryset.count()  # общее количество контактов
        paginated_queryset = queryset[first:first + rows]  # срез для текущей страницы

        serializer = ContactSerializer(paginated_queryset, many=True)

        # Оборачиваем список контактов в формат "items + total" для фронта
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
