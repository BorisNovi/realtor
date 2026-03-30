from django.contrib import admin
from .models import User  # Импортируем нашу модель пользователей

@admin.register(User)  # Регистрируем модель в админке
class CustomUserAdmin(admin.ModelAdmin):
    list_display = (
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
    )  
    search_fields = ('email',)  
    list_filter = ('is_active', 'is_staff')  