# Сериалайзер для адреса недвижимости. Используется в других сериалайзерах.

from rest_framework import serializers

class AddressSerializer(serializers.Serializer):
    city = serializers.CharField()
    road = serializers.CharField()
    house = serializers.CharField()
    apartment = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    position = serializers.JSONField(required=False, allow_null=True)