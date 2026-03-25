from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import Country
from .serializers import CountrySerializer
from rest_framework import permissions

class CountryViewSet(ReadOnlyModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    lookup_field = "code" 