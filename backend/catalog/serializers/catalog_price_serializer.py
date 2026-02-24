from rest_framework import serializers

class PriceSerializer(serializers.Serializer):
    value = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField(max_length=3)

def build_price(obj):
    return {
        "value": obj.price_value,
        "currency": obj.price_currency
    }