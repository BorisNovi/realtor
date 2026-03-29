import re
from colorama import Fore
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from countries.models import Country
from file.file_utils import make_files_permanent

User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):   
    class Meta:
        model = User
        fields = [
            'email', 
            'company_logo',
            'first_name',
            'last_name',
            'phone',
            'default_country',
            'default_currency', 
            'company_name', 
            'date_added', 
            'role',
            'marketing_consent1',
            'marketing_consent2',
        ]
        read_only_fields = ['date_added', 'role']

        # TODO: дублируется с user_response!!!!!!!!!

    def validate_phone(self, value):
        if not value:
            return value
        
        phone = re.sub(r'[\s\-\(\)]', '', value)
        
        if not re.match(r'^\+?[1-9]\d{6,14}$', phone):
            raise serializers.ValidationError(
                'Введите корректный номер телефона. Формат: +995591234567'
            )
        
        return phone
    
    def validate_default_country(self, value):
        value = value.strip().lower()

        if len(value) != 2 or not value.isalpha():
            raise serializers.ValidationError("INVALID_FORMAT")

        if not Country.objects.filter(code=value).exists():
            raise serializers.ValidationError("DOES_NOT_MATCH_ANY_COUNTRY")

        return value
            
    def update(self, instance, validated_data):
        logo = validated_data.get('company_logo', None)
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




