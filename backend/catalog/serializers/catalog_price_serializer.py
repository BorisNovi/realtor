# catalog/serializers/catalog_price_serializer.py
from rest_framework import serializers

class PriceSerializer(serializers.Serializer):
    value = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField(max_length=3)

# Используется в дочерних сериализаторах для вложенного представления цены
def build_price(obj):
    return {
        "value": obj.price_value,
        "currency": obj.price_currency
    }

# Этот сериализатор отвечает за представление цены объекта недвижимости. 
# Используется в других сериализаторах для вложенного отображения цены.
