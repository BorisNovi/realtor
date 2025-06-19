from rest_framework import serializers
from catalog.models import Flat

class FlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flat
        fields = '__all__'
        extra_kwargs = {
            'rooms': {'required': False},
            'floor_current': {'required': False},
            'floor_full': {'required': False},
            'bath': {'required': False},
            'shower': {'required': False},
            'air_conditioning': {'required': False},
            'fireplace': {'required': False},
            'beautiful_view': {'required': False},
            'new_building': {'required': False},
            'elevator': {'required': False},
            'contact': {'required': False, 'allow_null': True},
        }
