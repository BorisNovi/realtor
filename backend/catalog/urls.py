# catalog/urls.py
from django.urls import path
from catalog.views.catalog_detail_view import CatalogDetailView
from catalog.views.catalog_map_view import CatalogMapView
from catalog.views.create_object_view import PropertyCreateView
from catalog.views.catalog_list_view import CatalogListView
from catalog.views.catalog_bulk_delete_view import CatalogBulkDeleteView

urlpatterns = [
    path('/property_object', PropertyCreateView.as_view(), name='property-create'),            # POST
    path('/catalog', CatalogListView.as_view(), name='catalog'),                               # GET (список)
    path('/catalog/catalog_map', CatalogMapView.as_view(), name='catalog-map'),  # GET (карта)
    path('/catalog/delete', CatalogBulkDeleteView.as_view(), name="catalog-bulk-delete"),      # POST/DELETE
    path('/property_object/<int:pk>', CatalogDetailView.as_view(), name='property-detail'),    # GET / PUT / PATCH
]

# проверил, все пути работают корректно. Слэши в начале URLов нужны!