from rest_framework.views import APIView
from rest_framework.response import Response
from catalog.models import Flat, Office, LandPlot
from catalog.serializers.catalog_item import CatalogItemSerializer


class CatalogListView(APIView):
    def get(self, request):
        flats = Flat.objects.all()
        offices = Office.objects.all()
        lands = LandPlot.objects.all()

        all_items = list(flats) + list(offices) + list(lands)

        serializer = CatalogItemSerializer(all_items, many=True)
        return Response({
            "items": serializer.data,
            "total": len(serializer.data),
        })
