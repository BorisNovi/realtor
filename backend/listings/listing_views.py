# listings/views.py
import json
import re
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from listings.models import Listing
from listings.listing_serializers import ListingSerializer
from typing import Optional
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.db.models import Q
from django.shortcuts import get_object_or_404

# Маппинг camelCase -> snake_case
CAMEL_TO_SNAKE = {
    "name": "name",
    "dateAdded": "date_added",
}

# Контроллер для листингов с поддержкой создания листинга
class ListingsView(APIView):
    # authentication_classes = [JWTAuthentication]  
    # permission_classes = [permissions.IsAuthenticated]

    # Тестовая среда
    authentication_classes = []  
    permission_classes = [permissions.AllowAny]

    # Вспомогательный метод для построения префиксного tsquery
    def _build_prefix_tsquery(self, text: str) -> SearchQuery:
        tokens = re.findall(r'\w+', text, flags=re.UNICODE)
        if not tokens:
            return SearchQuery(text)
        raw = ' & '.join(f"{token}:*" for token in tokens)
        return SearchQuery(raw, search_type='raw')
    
    # Создание нового листинга ../listing/
    def post(self, request):
        serializer = ListingSerializer(data=request.data) # Объявляем сериализатор с входными данными 
        if serializer.is_valid(): # Проверяем валидность данных
            serializer.save() # Сохраняем новый листинг в БД
            return Response(serializer.data, status=status.HTTP_201_CREATED)  # Возвращаем созданный листинг с кодом 201
        return Response(serializer.errors, status=400) # Возвращаем ошибки валидации с кодом 400
    
    # Получение списка листингов ../listing/list c поддержкой поиска, пагинации и сортировки
    def get(self, request: Request, pk: Optional[int] = None) -> Response:
        # Получение одного листинга
        if pk is not None:
            listing = get_object_or_404(Listing, pk=pk)
            serializer = ListingSerializer(listing)
            return Response(serializer.data)

        # Параметры поиска и сортировки
        search = request.query_params.get("search")
        first = int(request.query_params.get("first", 0))
        rows = int(request.query_params.get("rows", 10))
        sort_field_camel = request.query_params.get("sortField")
        sort_order = request.query_params.get("sortOrder", "asc")

        # Базовый queryset
        queryset = Listing.objects.all()

        # Full-text поиск
        if search:
            tsquery = self._build_prefix_tsquery(search)
            vector = SearchVector("name")  # можно добавить другие поля
            fts_qs = (
                queryset
                .annotate(search_vector=vector)
                .filter(search_vector=tsquery)
                .annotate(rank=SearchRank(vector, tsquery))
                .order_by("-rank")
            )
            queryset = fts_qs if fts_qs.exists() else queryset.filter(
                Q(name__icontains=search) | Q(phone__icontains=search)
            )

        # Сортировка с маппингом
        sort_field = CAMEL_TO_SNAKE.get(sort_field_camel)
        if sort_field:
            direction = "-" if sort_order.lower() == "desc" else ""
            queryset = queryset.order_by(f"{direction}{sort_field}")
        else:
            # дефолтная сортировка по дате добавления
            queryset = queryset.order_by("-date_added")

        # пагинация подборок
        total_count: int = queryset.count()
        paginated_queryset = queryset[first:first + rows]
        serializer = ListingSerializer(paginated_queryset, many=True)
       
        return Response({
            "items": serializer.data, 
            "total": total_count}, 
            status=status.HTTP_200_OK
        )

    # Частичное обновление листинга ../listing/<int:pk>
    def patch(self, request: Request, pk: int) -> Response:
        try:
            listing = Listing.objects.get(pk=pk)
        except Listing.DoesNotExist:
            return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

        # partial=True — обновляем только переданные поля
        serializer = ListingSerializer(listing, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Обновление листинга ../listing/<int:pk>
    def put(self, request: Request, pk: int) -> Response:
        try:
            listing = Listing.objects.get(pk=pk)
        except Listing.DoesNotExist:
            return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

        # partial=True — обновляем только переданные поля
        serializer = ListingSerializer(listing, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Удаление листинга ../listing?ids=[1,2,3]
    # Ожидает JSON-массив ID в поле "ids" тела запроса
    def delete(self, request) -> Response:
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
        # Ищем листинг с нужным токеном
        listing = get_object_or_404(Listing, public_link__token=token)

        # Проверяем доступность
        if not listing.public_link.get("available", False):
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ListingSerializer(listing)
        data = serializer.data

        remove_contacts(data)

        return Response(data, status=status.HTTP_200_OK)

