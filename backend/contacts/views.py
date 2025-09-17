from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from contacts.models import Contact
from contacts.serializers import ContactSerializer

from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank # Инструменты для полнотекстового поиска 

# Новые с корректными путями
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

        serializer = ContactSerializer(queryset, many=True)
        return Response(serializer.data)

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
