from rest_framework import generics, permissions
from rest_framework.response import Response
from .serializers.catalog import CatalogCreateSerializer

class PropertyCreateView(generics.CreateAPIView):
    serializer_class = CatalogCreateSerializer
    #permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Выводим данные, которые приходят в запросе
        print("Received data:", self.request.data)

        # Теперь вызываем сохранение объекта с помощью сериализатора
        serializer.save()
