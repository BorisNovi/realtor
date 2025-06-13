from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from catalog.serializers.catalog_serializer import PROPERTY_SERIALIZER_MAP
from catalog.serializers.flat_details_serializer import FlatDetailSerializer
from catalog.views.catalog_list_view import PROPERTY_MODEL_MAP

PROPERTY_SERIALIZER_MAP = {
    'flat': FlatDetailSerializer,
    # 'office': OfficeDetailSerializer,
    # 'landplot': LandPlotDetailSerializer,
}

class CatalogDetailView(APIView):

    def get_instance(self, pk):
        for model in PROPERTY_MODEL_MAP.values():
            try:
                return model.objects.get(pk=pk, deleted_at__isnull=True)
            except model.DoesNotExist:
                continue
        return None

    def get(self, request, pk):
        instance = self.get_instance(pk)
        if not instance:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        property_type = next(
            (key for key, model in PROPERTY_MODEL_MAP.items() if isinstance(instance, model)),
            None
        )
        serializer_class = PROPERTY_SERIALIZER_MAP.get(property_type)
        if not serializer_class:
            return Response({"detail": "Unsupported property type."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = serializer_class(instance)
        return Response(serializer.data)

    def patch(self, request, pk):
        instance = self.get_instance(pk)
        if not instance:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        status_value = request.data.get("status")
        if not status_value:
            return Response({"detail": "Missing 'status' field."}, status=status.HTTP_400_BAD_REQUEST)

        instance.status = status_value
        instance.save()

        property_type = next(
            (key for key, model in PROPERTY_MODEL_MAP.items() if isinstance(instance, model)),
            None
        )
        serializer_class = PROPERTY_SERIALIZER_MAP.get(property_type)
        if not serializer_class:
            return Response({"detail": "Unsupported property type."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = serializer_class(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
