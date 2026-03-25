from django.urls import path
from countries.views import CountryViewSet
from rest_framework.routers import DefaultRouter

# Нормальный прод-вариант для взрослых дядь:
# router = DefaultRouter()
# router.register(r"countries", CountryViewSet, basename="countries")

# urlpatterns = router.urls

# Устаревший способ
country_list = CountryViewSet.as_view({'get': 'list'})
country_detail = CountryViewSet.as_view({'get': 'retrieve'})

urlpatterns = [
    path("", country_list),
    path("/<str:code>", country_detail), 
]