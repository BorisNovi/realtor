from rest_framework.views import APIView
from rest_framework.response import Response
from catalog.models import Flat, Office, LandPlot
from catalog.serializers.catalog import PROPERTY_SERIALIZER_MAP
from catalog.serializers.catalog_item import CatalogItemSerializer
from ..pagination import FrontendPagination
from itertools import chain

class CatalogListView(APIView):
    def get(self, request):
        flats = Flat.objects.all()
        offices = Office.objects.all()
        lands = LandPlot.objects.all()

        # Объединяем и сортируем объекты
        combined = sorted(chain(flats, offices, lands), key=lambda obj: obj.date_added, reverse=True)

        # Применяем пагинацию
        paginator = FrontendPagination()
        paginated_qs = paginator.paginate_queryset(combined, request)

        serialized_data = []
        for obj in paginated_qs:
            serializer = CatalogItemSerializer(obj)
            serialized_data.append(serializer.data)

        # Возвращаем пагинированный ответ
        return paginator.get_paginated_response(serialized_data)