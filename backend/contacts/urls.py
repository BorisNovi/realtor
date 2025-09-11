from django.urls import path
from .views import ContactView

urlpatterns = [
    path('', ContactView.as_view(), name='create_contact'), # Список и создание контакта
    path('<int:pk>/', ContactView.as_view(), name='update_contact'), # Обновление конкретного контакта
]
