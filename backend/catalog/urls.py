from django.urls import path
from .views import PropertyCreateView

urlpatterns = [
    path('/property_object', PropertyCreateView.as_view(), name='property-create'),
    path('/catalog')
]
