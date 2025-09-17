from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('user_auth.urls')),
    path('api/v1/', include('catalog.urls')),
    path('api/v1/contact/', include('contacts.urls')), # Убрал С на конце
]
