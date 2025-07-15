from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from catalog.interfaces.property_response import format_list_property
from catalog.models import Flat, Office, LandPlot
from catalog.serializers.catalog_serializer import PROPERTY_SERIALIZER_MAP
from catalog.serializers.catalog_serializer import CatalogCreateSerializer
from ..utils.pagination import FrontendPagination
from itertools import chain
from catalog.utils.filters import apply_catalog_filters

PROPERTY_MODEL_MAP = {
    'flat': Flat,
    'office': Office,
    'landplot': LandPlot,
}

# Этот класс отвечает за получение списка объектов недвижимости
# Он использует пагинацию и фильтрацию для формирования ответа
class CatalogListView(APIView):
    def get(self, request):
        flats = Flat.objects.filter(deleted_at__isnull=True) 
        offices = Office.objects.filter(deleted_at__isnull=True)
        lands = LandPlot.objects.filter(deleted_at__isnull=True)
        
        # TODO: Добавить прочие типы недвижимости
        combined = sorted(chain(flats, offices, lands), key=lambda obj: obj.date_added, reverse=True) 

        filtered = apply_catalog_filters(combined, request.query_params)
        paginator = FrontendPagination()
        paginated_qs = paginator.paginate_queryset(filtered, request)

        serialized_data = [format_list_property(obj) for obj in paginated_qs]

        return paginator.get_paginated_response(serialized_data)

