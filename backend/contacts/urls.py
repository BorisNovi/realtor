from django.urls import path
from .views import ContactView

urlpatterns = [
    path('list/', ContactView.as_view(), name='contact-list'),             # список контактов
    path('', ContactView.as_view(), name='contact-create'),                # создание контакта
    path('<int:pk>/', ContactView.as_view(), name='contact-detail'),       # получение, обновление, удаление конкретного контакта
]
