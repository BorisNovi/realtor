from django.urls import path
from . import listing_views
from .listing_views import ListingsView

urlpatterns = [
    path('', ListingsView.as_view(
        {
            'post':'create',         # /api/v1/listings/  (создание листинга)
            'get':'list',            # /api/v1/listings/  (список листингов с поддержкой поиска, сортировки и пагинации)
            'delete': 'bulk_delete', # /api/v1/listings/  (пакетное удаление листингов)
        }
    )), 
    
    # Дополнительный путь для получения списка подборок 
    path('/list', ListingsView.as_view({'get': 'list'})),

    # /api/v1/listings/<pk>
    path('/<int:pk>', ListingsView.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
    })),

    path('/<str:token>', listing_views.PublicListingView.as_view(), name="public-listing"),  # получение 1 открытого листинга
]


# ВАЖНО: порядок путей имеет значение!