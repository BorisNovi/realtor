# listings/urls.py
from django.urls import path
from . import listing_views

urlpatterns = [
    path('', listing_views.ListingsView.as_view(), name='listing-create'),                        # создание листинга
    path('/list', listing_views.ListingsView.as_view(), name='listing-list'),                     # список листингов
    path('/<int:pk>', listing_views.ListingsView.as_view(), name='listing-detail'),               # получение, обновление, удаление листинга
    path('/<str:token>', listing_views.PublicListingRedirectView.as_view(), name="public-listing"),  # получение 1 открытого листинга
]

# ВАЖНО: порядок путей имеет значение!