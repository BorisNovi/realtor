from catalog.models import Flat, Office, LandPlot
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
from rest_framework.permissions import IsAuthenticated

class CatalogBulkDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        ids_param = request.query_params.get("ids", "[]")
        try:
            ids = json.loads(ids_param)
        except json.JSONDecodeError:
            return Response({"detail": "Invalid JSON"}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(ids, list):
            return Response({"detail": "Invalid ID list"}, status=status.HTTP_400_BAD_REQUEST)

        for model in [Flat, Office, LandPlot]:
            items = model.objects.filter(id__in=ids, is_deleted=False)
            for item in items:
                item.soft_delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
