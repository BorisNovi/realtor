from rest_framework import serializers
from .models import Country

# Принимает данные от клиента для последующей записи.
class CountryInputSerializer(serializers.Serializer):
    name = serializers.CharField()

class CountrySerializer(serializers.Serializer):
    country = CountryInputSerializer()

    def validate_country(self, value):
        code = value["name"]
        try:
            return Country.objects.get(code=code)
        except Country.DoesNotExist:
            raise serializers.ValidationError({
                "error": "NOT_FOUND",
                "message": "Country not found."
            })


class CountryReadOnlySerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="code")
    position = serializers.SerializerMethodField()

    class Meta:
        model = Country
        fields = [
            "id", 
            "name", 
            "position"
        ]
        read_only_fields = ["id", "name", "position"]

    def get_position(self, obj):
        return [obj.capital_lat, obj.capital_lng] 
    
