# catalog/serializers/catalog_map_serializer.py
from rest_framework import serializers
from catalog.catalog_models import Flat
from contacts.contact_serializers import ContactSerializer
from .catalog_address_serializer import AddressSerializer

# Сериализатор для запроса списка всех объектов в сокращенном формате НА КАРТЕ. 
# Используется в CatalogMapView
class CatalogMapSerializer(serializers.Serializer):
    # Требуемые поля из BaseProperty.
    id = serializers.IntegerField(read_only=True)
    property_type = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    address = AddressSerializer(read_only=True)
    
    # Дополнительные поля, который могут пригодиться на карте 
    zoning_type = serializers.CharField(read_only=True)
    photos = serializers.ListField(child=serializers.CharField(), read_only=True)
    contact = ContactSerializer(read_only=True)
    area = serializers.DecimalField(max_digits=7, decimal_places=2, read_only=True)
    date_added = serializers.DateTimeField(read_only=True)
    comment = serializers.CharField(read_only=True, allow_null=True)
    is_deleted = serializers.BooleanField(read_only=True)
    deleted_at = serializers.DateTimeField(read_only=True, allow_null=True)
    price = serializers.SerializerMethodField()

    # вытаскиваем цену в нужном формате
    # это нельзя сделать через сериализатор поля, т.к. цена хранится в двух полях модели
    def get_price(self, obj):
        return {
            "value": obj.price_value,
            "currency": obj.price_currency,
        }

    # Форматируем ответ (возвращаю все поля, мало ли что пригодится на фронте в будущем)
    def to_representation(self, obj: Flat):
        base = super().to_representation(obj)
        return {
            "id": base["id"],
            "photos": base["photos"],
            "propertyType": base["property_type"],
            "zoningType": base["zoning_type"],
            "status": base["status"],
            "address": base["address"],
            "price": base["price"],
            "area": float(base["area"]) if base["area"] else None,
            "dateAdded": base["date_added"],
            "contact": base["contact"],
            "comment": base["comment"],
        }