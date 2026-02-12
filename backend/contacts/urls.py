# contacts/urls.py
from django.urls import path
from .contact_views import ContactView

# contacts/urls.py
urlpatterns = [
    path('', ContactView.as_view(
        {
            'post':'create',         # /api/v1/contact/  (создание контакта)
            'get':'list',            # /api/v1/contact/  (список контактов с поддержкой поиска, сортировки и пагинации)
            'delete': 'bulk_delete', # /api/v1/contact/  (пакетное удаление контактов)
        }
    )), 
    
    # /api/v1/contact/<pk>
    path('/<int:pk>', ContactView.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
    })),
    
    # Дополнительный путь для получения списка контактов (может быть полезен для фронтенда, чтобы не путать с основным CRUD-эндпоинтом)
    path('/list', ContactView.as_view({'get': 'list'})),              # /api/v1/contact/list
]

# Проверил, все пути работают корректно. Слэши в начале URLов нужны!