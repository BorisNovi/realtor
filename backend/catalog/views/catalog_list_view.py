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

class CatalogListView(APIView):
    def get(self, request):
        flats = Flat.objects.filter(deleted_at__isnull=True)
        offices = Office.objects.filter(deleted_at__isnull=True)
        lands = LandPlot.objects.filter(deleted_at__isnull=True)
        
        # TODO: Добавить прочие типы недвижимости
        combined = sorted(chain(flats, offices, lands), key=lambda obj: obj.date_added, reverse=True) 

        # Применяем фильтрацию
        filtered = apply_catalog_filters(combined, request.query_params)

        # Пагинация
        paginator = FrontendPagination()
        paginated_qs = paginator.paginate_queryset(filtered, request)

        serialized_data = [format_list_property(obj) for obj in paginated_qs]

        return paginator.get_paginated_response(serialized_data)

    def put(self, request):
            object_id = request.data.get('id')
            property_type = request.data.get('property_type')

            if not object_id or not property_type:
                return Response({'detail': 'Missing id or property_type'}, status=status.HTTP_400_BAD_REQUEST)

            model_class = PROPERTY_MODEL_MAP.get(property_type)
            if not model_class:
                return Response({'detail': 'Invalid property_type'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                instance = model_class.objects.get(id=object_id)
            except model_class.DoesNotExist:
                return Response({'detail': 'Object not found'}, status=status.HTTP_404_NOT_FOUND)

            serializer = CatalogCreateSerializer(instance, data=request.data)
            serializer.is_valid(raise_exception=True)
            updated_instance = serializer.save()
            return Response(CatalogCreateSerializer(updated_instance).data)