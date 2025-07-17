from rest_framework import serializers
from catalog.models import Flat

class FlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flat
        fields = '__all__'

# Возможно, этот и похожие сериализаторы можно будет устранить в будущем 
# при правильной настройке модели (сообщить DRF что поля не null-able итд). 