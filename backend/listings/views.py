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
from listings.serializers import ListingSerializer
from typing import Optional
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.db.models import Q

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
        
        # Получение одного листинга по pk ../listing/<int:pk>
        if pk is not None:
            try:
                listing = Listing.objects.get(pk=pk)
            except Listing.DoesNotExist:
                return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)
            serializer = ListingSerializer(listing)
            return Response(serializer.data)
        
        # Список для расширенного варианта ответа (search, pagination, sorting)
        search: Optional[str] = request.query_params.get("search")
        first: int = int(request.query_params.get("first", 0))
        rows: int = int(request.query_params.get("rows", 10))
        sort_field: Optional[str] = request.query_params.get("sortField")
        sort_order: str = request.query_params.get("sortOrder", "asc")

        # Формируем базовый queryset
        queryset = Listing.objects.all()
        if search:
            tsquery = self._build_prefix_tsquery(search)
            vector = SearchVector("name") # TODO: Добавь другие поля по необходимости
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
        if sort_field in ["name"]: # TODO: Добавь другие поля по необходимости
            direction = "-" if sort_order.lower() == "desc" else ""
            queryset = queryset.order_by(f"{direction}{sort_field}")

        total_count: int = queryset.count()
        paginated_queryset = queryset[first:first + rows]
        serializer = ListingSerializer(paginated_queryset, many=True)
       
        return Response({
            "items": serializer.data, 
            "total": total_count}, 
            status=status.HTTP_200_OK
        )

    # Обновление существующего листинга ../listing/<int:pk>
    def put(self, request: Request, pk: int) -> Response:
        try:
            listing = Listing.objects.get(pk=pk)
        except Listing.DoesNotExist:
            return Response({"detail": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

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