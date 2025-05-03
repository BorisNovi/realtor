from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
import re
import logging

User = get_user_model()

# Validation constants
MIN_PASSWORD_LENGTH = 8
EMAIL_REGEX = r'^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
PASSWORD_SPECIAL_CHARS = r'[!@#$%^&*(),.?":{}|<>]'
FORBIDDEN_DOMAINS = {'example.com'}

logger = logging.getLogger(__name__)

def raise_error(message, code):
    return ValidationError({'message': message, 'code': code})

class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if not re.match(EMAIL_REGEX, value):
            raise raise_error("Invalid email format", 
                              "invalid_email_format")
        
        domain = value.split('@')[1].lower()
        if domain in FORBIDDEN_DOMAINS:
            raise raise_error("Registration with this domain is forbidden", 
                              "forbidden_domain")
        
        # Не сообщаем пользователю, если email уже зарегистрирован
        if User.objects.filter(email=value).exists():
            logger.info(f"Signup attempt with existing email: {value}")
        
        return value

    def validate_password(self, value):
        if len(value) < MIN_PASSWORD_LENGTH:
            raise raise_error(f"Password must be at least {MIN_PASSWORD_LENGTH} characters", 
                              "password_too_short")
        if not re.search(r'[A-Z]', value):
            raise raise_error("Password must contain at least one uppercase letter", 
                              "password_no_uppercase")
        if not re.search(r'\d', value):
            raise raise_error("Password must contain at least one digit", 
                              "password_no_digit")
        if not re.search(PASSWORD_SPECIAL_CHARS, value):
            raise raise_error("Password must contain at least one special character", 
                              "password_no_special_char")
        return value

    def validate(self, data):
        password = data['password']
        password_confirmation = data['password_confirmation']
        email = data.get('email', '').lower()
        password_lower = password.lower()

        errors = {}

        if password != password_confirmation:
            msg = "Passwords do not match"
            code = "password_mismatch"
            errors['password'] = {'message': msg, 'code': code}
            errors['password_confirmation'] = {'message': msg, 'code': code}

        if email in password_lower:
            errors['password'] = {'message': 'Password must not contain email', 
                                  'code': 'password_contains_email'}

        email_parts = email.split('@')
        if len(email_parts) > 1:
            username = email_parts[0]
            domain = email_parts[1]
            if (len(username) >= 3 and username in password_lower) or \
               (len(domain) >= 3 and domain in password_lower):
                errors['password'] = {
                    'message': 'Password must not contain email parts (username or domain)',
                    'code': 'password_contains_email_parts'
                }

        if errors:
            raise ValidationError(errors)

        return data

    def create(self, validated_data):
        """Returns validated data for further processing (not creating a real user)."""
        return validated_data
