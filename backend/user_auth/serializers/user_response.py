from rest_framework import serializers
from users.models import User

# Используется для ответа на запросы чек, профиль и т.д. 
# Там, где нужно отдать данные о пользователе, но не нужно их менять.
class UserResponseSerializer(serializers.ModelSerializer):
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
            'marketing_consent1',
            'marketing_consent2',
            'date_added', 
            'role',
        ]
        read_only_fields = ['date_added', 'role']

    # -------------------- ДОСТАЕМ АТРИБУТЫ ПОЛЬЗОВАТЕЛЯ --------------------
    
    def get_company_name(self, obj):
        if obj.user:
            return obj.user.company_name
        return None

    def get_company_logo(self, obj):
        if obj.user:
            return obj.user.company_logo
        return None

    def get_first_name(self, obj):
        if obj.user:
            return obj.user.first_name
        return None
    
    def get_last_name(self, obj):
        if obj.user:
            return obj.user.last_name
        return None
    
    def get_phone(self, obj):
        if obj.user:
            return obj.user.phone
        return None