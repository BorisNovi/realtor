from rest_framework import serializers
from contacts.contact_serializers import ContactSerializer
from .catalog_address_serializer import AddressSerializer

# Сериализатор для запроса списка всех объектов в сокращенном формате. 
# Используется в CatalogListView
class CatalogListSerializer(serializers.Serializer):
    # Поля из BaseProperty. 
    # Если что-то добавляешь, не забудь добавить в to_representation
    
    id = serializers.IntegerField(read_only=True)
    property_type = serializers.CharField(read_only=True)
    zoning_type = serializers.CharField(read_only=True)
    photos = serializers.ListField(child=serializers.CharField(), read_only=True)
    address = AddressSerializer(read_only=True)
    contact = ContactSerializer(read_only=True)
    area = serializers.DecimalField(max_digits=7, decimal_places=2, read_only=True)
    date_added = serializers.DateTimeField(read_only=True)
    status = serializers.CharField(read_only=True)
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

    # Преобразование данных для вывода в нужном фронте формате
    def to_representation(self, instance):
        base = super().to_representation(instance)
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
