from rest_framework import serializers
from rest_framework.exceptions import ValidationError

# следующий уровень - nested. 

class ConferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conference
        fields = [
            'title',
            'location',
            'host',
            'capacity',
        ]
        read_only_fields = [
            'host',
        ]


    def validate_capacity(self, value):
        if value < 0:
            raise ValidationError('error')
        return value


    def update(self, value, validated_data):
        validated_data.pop('host', None)
        return super().update(value, validated_data)

