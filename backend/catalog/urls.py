from django.urls import path
from .views import PropertyCreateView

urlpatterns = [
    path('', PropertyCreateView.as_view(), name='property-create'),
]
