from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from catalog.serializers.catalog_serializer import CatalogCreateSerializer
from catalog.serializers.flat_serializer import FlatSerializer

class PropertyCreateView(generics.CreateAPIView):
    # authentication_classes = [JWTAuthentication]  
    # permission_classes = [permissions.IsAuthenticated]

    # Тестовая среда
    authentication_classes = []  
    permission_classes = [permissions.AllowAny]
    
    serializer_class = CatalogCreateSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Создаём объект через сериализатор
        property_obj = serializer.save()

        # Отдаём фронту объект в формате IPropertyObject
        response_data = FlatSerializer(property_obj).data  # здесь автоматически вызывается to_representation

        return Response(response_data, status=status.HTTP_201_CREATED)
