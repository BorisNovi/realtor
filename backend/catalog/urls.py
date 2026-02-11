# catalog/urls.py
from django.urls import path
from catalog.views.catalog_map_view import CatalogMapView
from catalog.views.create_update_object_view import PropertyObjectAPIView
from catalog.views.catalog_list_view import CatalogListView
from catalog.views.catalog_bulk_delete_view import CatalogBulkDeleteView

urlpatterns = [
    path('/property_object', PropertyObjectAPIView.as_view(), name='property-create'),         # POST
    path('/property_object/<int:pk>', PropertyObjectAPIView.as_view(), name='property-detail'),# GET / PUT / PATCH
    path('/catalog', CatalogListView.as_view({'get': 'list'}), name='catalog'),                               # GET (список)
    path('/catalog/catalog_map', CatalogMapView.as_view(), name='catalog-map'),                # GET (карта)
    path('/catalog/delete', CatalogBulkDeleteView.as_view(), name="catalog-bulk-delete"),      # POST/DELETE
]

# проверил, все пути работают корректно. Слэши в начале URLов НУЖНЫ!