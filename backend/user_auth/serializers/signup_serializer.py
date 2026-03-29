from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'email', 
            'password', 
            'password_confirmation', 
            'company_name', 
            'company_logo'
        )

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise ValidationError({
                "error": "USER_ALREADY_EXISTS",
                "message": "A user with that email already exists."
            })
        return value

    def validate(self, attrs):
        password = attrs.get('password')
        password_confirmation = attrs.pop('password_confirmation', None)

        if password != password_confirmation:
            raise ValidationError({
                "error": "PASSWORDS_DO_NOT_MATCH",
                "message": "New passwords do not match"
            })

        # Стандартные проверки безопасности Django
        validate_password(password)

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user
