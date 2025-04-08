from rest_framework import serializers
from .flat import FlatSerializer
from .office import OfficeSerializer
from .land import LandPlotSerializer
# остальные потом добавим: HouseSerializer, GarageSerializer и т.п.

PROPERTY_SERIALIZER_MAP = {
    'flat': FlatSerializer,
    'office': OfficeSerializer,
    'landplot': LandPlotSerializer,
    # 'house': HouseSerializer,
    # и т.д.
}

class CatalogCreateSerializer(serializers.Serializer):
    # Общие обязательные поля
    property_type = serializers.ChoiceField(choices=list(PROPERTY_SERIALIZER_MAP.keys()))

    title = serializers.CharField()
    price_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    price_currency = serializers.CharField(max_length=3)
    area = serializers.DecimalField(max_digits=7, decimal_places=2)
    address = serializers.CharField()
    photos = serializers.ListField(
        child=serializers.URLField(), default=list, required=False
    )
    map_link = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    comment = serializers.CharField(required=False, allow_blank=True)

    # Все остальные специфические поля передаём как kwargs
    # Это важно — чтобы поддержать динамичность
    def to_internal_value(self, data):
        base_fields = super().to_internal_value(data)

        property_type = base_fields.get('property_type')
        extra_fields = {
            k: v for k, v in data.items() if k not in base_fields
        }

        base_fields['extra_fields'] = extra_fields
        return base_fields

    def create(self, validated_data):
        property_type = validated_data.pop('property_type')
        extra_fields = validated_data.pop('extra_fields')

        # Объединяем общие поля и специфические
        combined_data = {**validated_data, **extra_fields}

        serializer_class = PROPERTY_SERIALIZER_MAP.get(property_type)
        if not serializer_class:
            raise serializers.ValidationError(f"Unsupported property type: {property_type}")

        serializer = serializer_class(data=combined_data)
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    def to_representation(self, instance):
        # возвращаем, как сериализует конкретный сериализатор
        for property_type, serializer_class in PROPERTY_SERIALIZER_MAP.items():
            if isinstance(instance, serializer_class.Meta.model):
                return serializer_class(instance).data
        return super().to_representation(instance)
