from rest_framework.views import APIView
from rest_framework.response import Response
from catalog.models import Flat, Office, LandPlot
from catalog.serializers.catalog import PROPERTY_SERIALIZER_MAP
from catalog.serializers.catalog_item import CatalogItemSerializer
from ..utils.pagination import FrontendPagination
from itertools import chain
from catalog.utils.filters import apply_catalog_filters

class CatalogListView(APIView):
    def get(self, request):
        flats = Flat.objects.filter(deleted_at__isnull=True)
        offices = Office.objects.filter(deleted_at__isnull=True)
        lands = LandPlot.objects.filter(deleted_at__isnull=True)

        combined = sorted(chain(flats, offices, lands), key=lambda obj: obj.date_added, reverse=True)

        # Применяем фильтрацию
        filtered = apply_catalog_filters(combined, request.query_params)

        # Пагинация
        paginator = FrontendPagination()
        paginated_qs = paginator.paginate_queryset(filtered, request)

        serialized_data = []
        for obj in paginated_qs:
            serializer = CatalogItemSerializer(obj)
            serialized_data.append(serializer.data)

        return paginator.get_paginated_response(serialized_data)
