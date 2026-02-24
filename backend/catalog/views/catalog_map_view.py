# catalog_map_view.py
# Ответственный за получение объектов недвижимости в заданных координатах для отображения на карте.
from catalog.catalog_models import Property
from catalog.serializers.catalog_map_serializer import CatalogMapSerializer
from catalog.utils.filters import apply_catalog_filters
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import viewsets
from realtor import mixins
from rest_framework.exceptions import ValidationError
from django.db.models.functions import Cast
from django.db.models import F, FloatField

# Получение объектов недвижимости в заданных координатах при работе с картой.
class CatalogMapView(mixins.CurrentUserQuerysetMixin, viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]  
    serializer_class = CatalogMapSerializer
    queryset = Property.objects.filter(is_deleted=False)
        
    def get_queryset(self):
        qs = super().get_queryset()
        qs = apply_catalog_filters(qs, self.request.query_params)
               
        # Получаем координаты квадрата
        lng_min = self.request.query_params.get("lngMin") or self.request.query_params.get("box.minLng")
        lng_max = self.request.query_params.get("lngMax") or self.request.query_params.get("box.maxLng")
        lat_min = self.request.query_params.get("latMin") or self.request.query_params.get("box.minLat")
        lat_max = self.request.query_params.get("latMax") or self.request.query_params.get("box.maxLat")

        if not all([lng_min, lng_max, lat_min, lat_max]):
            raise ValidationError("MISSING_COORDINATES")

        lng_min, lng_max, lat_min, lat_max = map(float, [lng_min, lng_max, lat_min, lat_max])

        # Фильтрация через ORM по JSONField с позициями
        qs = qs.annotate(
            lng=Cast(F('address__position__0'), FloatField()),
            lat=Cast(F('address__position__1'), FloatField())
        ).filter(
            lng__gte=lng_min,
            lng__lte=lng_max,
            lat__gte=lat_min,
            lat__lte=lat_max
        )

        return qs
