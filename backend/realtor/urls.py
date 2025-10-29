# realtor/urls.py
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

# Основные URLы проекта, работают без слэша в конце
urlpatterns = [
    path('admin', admin.site.urls),
    path('api/v1/auth', include('user_auth.urls')),
    path('api/v1', include('catalog.urls')),
    path('api/v1/contact', include('contacts.urls')), 
    path("api/v1/file", include("file.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Короче, тут ни в начале, ни в конце слэши не нужны. 
# Они ставятся только в дочерних модулях и только в начале оных.