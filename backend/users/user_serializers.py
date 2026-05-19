import re
from colorama import Fore
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from countries.models import Country
from countries.serializers import CountryInputSerializer
from file.file_utils import make_files_permanent

User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):   
    country = CountryInputSerializer(required=False, allow_null=True, write_only=True)
    limits = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'email', 
            'company_logo',
            'first_name',
            'last_name',
            'phone',
            'country',
            'currency', 
            'company_name', 
            'date_added', 
            'role',
            'marketing_consent1',
            'marketing_consent2',
            'limits',
            'plan',
        ]
        read_only_fields = ['date_added', 'role']

    # хардкод лимитов.
    def get_limits(self, obj):
        return {
            "objects": 25,
            "contacts": 25,
            "listings": 5,
        }

    def validate_phone(self, value):
        if not value:
            return value
        
        phone = re.sub(r'[\s\-\(\)]', '', value)
        
        if not re.match(r'^\+?[1-9]\d{6,14}$', phone):
            raise serializers.ValidationError({
                "error": "INVALID_PHONE_NUMBER",
                "message": "Invalid phone number. Please enter a valid phone number."
            })
        
        return phone
    
    # Работает с объектом CountryInputSerializer, который ожидает поле "name" с кодом страны.
    def validate_country(self, value):
        if not value or not value.get("name"):
            return None    
        
        code = value["name"].strip().lower()

        if len(code) != 2 or not code.isalpha():
            raise serializers.ValidationError({
                "error": "INVALID_COUNTRY_CODE",
                "message": "Country code is invalid. Please enter a valid 2-letter country code."
            })

        if not Country.objects.filter(code=code).exists():
            raise serializers.ValidationError({
                "error": "DOES_NOT_EXIST",
                "message": "Country not found. Please make sure the country is correct."
            })

        return code  # в validated_data["country"] будет просто "ae"

    # Возвращает страну как словарь для чтения. 
    def get_country(self, obj):
        if not obj.country or obj.country == 'null':
            return None
        country = Country.objects.filter(code=obj.country).only("id", "code", "capital_lat", "capital_lng").first()
        if not country:
            return None
        return {
            "id": country.id,
            "name": country.code,
            "position": [country.capital_lng, country.capital_lat],
        }

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # подменяем country на полный объект при чтении
        if instance.country and instance.country != 'null':
            c = Country.objects.filter(code=instance.country).only("id", "code", "capital_lat", "capital_lng").first()
            ret["country"] = {
                "id": c.id,
                "name": c.code,
                "position": [c.capital_lng, c.capital_lat],
            } if c else None
        else:
            ret["country"] = None
        return ret

    def update(self, instance, validated_data):        
        logo = validated_data.pop('company_logo', None)
        if logo and logo != instance.company_logo:
            instance.company_logo = make_files_permanent(logo)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)       
        
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    new_password_confirmation = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        user = self.context['request'].user

        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({
                "error": "INVALID_OLD_PASSWORD",
                "message": "Old password is incorrect"
            })

        if attrs['new_password'] != attrs['new_password_confirmation']:
            raise serializers.ValidationError({
                "error": "PASSWORDS_DO_NOT_MATCH",
                "message": "New passwords do not match"
            })

        validate_password(attrs['new_password'], user)
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user




