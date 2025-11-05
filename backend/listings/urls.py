# listings/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.ListingsView.as_view(), name='listing-create'),                # создание листинга
    # path('/list', views.ListingsView.as_view(), name='listing-list'),             # список листингов
    # path('/<int:pk>', views.ListingsView.as_view(), name='listing-detail'),       # получение, обновление, удаление листинга
]