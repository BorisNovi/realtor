# listings/urls.py
from django.urls import path
from . import listing_views

urlpatterns = [
    path('', listing_views.ListingsView.as_view(), name='listing-create'),                # создание листинга
    path('/list', listing_views.ListingsView.as_view(), name='listing-list'),             # список листингов
    path('/<int:pk>', listing_views.ListingsView.as_view(), name='listing-detail'),       # получение, обновление, удаление листинга
]