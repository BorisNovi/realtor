from rest_framework import serializers
from users.models import User

class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 
            'email', 
            'role', 
            'company_name', 
            'company_logo', 
            'date_added', 
            'banned_at'
        ]