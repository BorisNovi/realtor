# contacts/urls.py
from django.urls import path
from .views import ContactView

urlpatterns = [
    path('', ContactView.as_view(), name='contact-create'),                # создание контакта
    path('/list', ContactView.as_view(), name='contact-list'),             # список контактов
    path('/<int:pk>', ContactView.as_view(), name='contact-detail'),       # получение, обновление, удаление конкретного контакта
]

# Проверил, все пути работают корректно. Слэши в начале URLов нужны!