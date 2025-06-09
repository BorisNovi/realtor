from django.urls import path
from catalog.views.catalog_detail_view import CatalogDetailView
from catalog.views.property_create_view import PropertyCreateView
from catalog.views.catalog_list_view import CatalogListView
from catalog.views.catalog_bulk_delete_view import CatalogBulkDeleteView

urlpatterns = [
    path('/property_object', PropertyCreateView.as_view(), name='property-create'),
    path('/catalog', CatalogListView.as_view(), name='catalog'),
    path('/catalog/delete', CatalogBulkDeleteView.as_view(), name="catalog-bulk-delete"),
    path('/catalog/<int:pk>', CatalogDetailView.as_view(), name='catalog-detail'),

]
