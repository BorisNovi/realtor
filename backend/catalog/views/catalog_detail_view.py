from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from catalog.serializers.catalog_serializer import PROPERTY_SERIALIZER_MAP
from catalog.serializers.flat_details_serializer import FlatDetailSerializer
from catalog.views.catalog_list_view import PROPERTY_MODEL_MAP

PROPERTY_SERIALIZER_MAP = {
    'flat': FlatDetailSerializer,  # выдача в интерфейсном формате
    # 'office': OfficeDetailSerializer,
    # 'landplot': LandPlotDetailSerializer,
}

class CatalogDetailView(APIView):
    def get(self, request, pk):
        # Пробуем найти объект в каждой модели
        instance = None
        for model in PROPERTY_MODEL_MAP.values():
            try:
                instance = model.objects.get(pk=pk, deleted_at__isnull=True)
                break
            except model.DoesNotExist:
                continue

        if not instance:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        # Определяем тип объекта по модели
        property_type = None
        for key, model in PROPERTY_MODEL_MAP.items():
            if isinstance(instance, model):
                property_type = key
                break

        serializer_class = PROPERTY_SERIALIZER_MAP.get(property_type)
        if not serializer_class:
            return Response({"detail": "Unsupported property type."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = serializer_class(instance)
        return Response(serializer.data)
