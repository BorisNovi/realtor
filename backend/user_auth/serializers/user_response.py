from rest_framework import serializers
from users.models import User

# Используется для ответа на запросы чек, профиль и т.д. 
# Там, где нужно отдать данные о пользователе, но не нужно их менять.
class UserResponseSerializer(serializers.ModelSerializer):
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
            'marketing_consent1',
            'marketing_consent2',
            'date_added', 
            'role',
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