from rest_framework import serializers
from listings.models import Listing

class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = ['id', 'name'] # Добавьте другие поля по необходимости

        def validate_name(self, value):
            if not value:
                raise serializers.ValidationError("❌🗨️ Название листинга не может быть пустым.")

            if len(value) < 3:
                raise serializers.ValidationError("❌ Название листинга должно содержать не менее 3 символов.")
            if len(value) > 100:
                raise serializers.ValidationError("❌ Название листинга не должно превышать 100 символов.")
            
            if Listing.objects.filter(name=value).exists():
                raise serializers.ValidationError("❌ Листинг с таким названием уже существует.")
            
            return value

# Дополнительные методы валидации для других полей можно добавить здесь при помощи 
# def validate(self, attrs):
    # if "test" in attrs['name'].lower():
    #     raise serializers.ValidationError("Имя не может содержать слово 'test'.")
    # return attrs
