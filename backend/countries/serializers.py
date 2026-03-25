from rest_framework import serializers
from .models import Country


class CountrySerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="code")
    position = serializers.SerializerMethodField()

    class Meta:
        model = Country
        fields = ("id", "name", "position")
        read_only_fields = ("id", "name", "position")

    def get_position(self, obj):
        return [obj.capital_lat, obj.capital_lng] # возвращаем [lat, lng]