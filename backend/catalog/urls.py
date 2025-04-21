from django.urls import path
from catalog.views.property_create_view import PropertyCreateView
from catalog.views.catalog_list_view import CatalogListView

urlpatterns = [
    path('/property_object', PropertyCreateView.as_view(), name='property-create'),
    path('/catalog', CatalogListView.as_view(), name='catalog'),
]
