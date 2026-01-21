from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

# Проверка сессии. Позволяет юзеру находиться в системе даже после обновления страницы. 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_session(request):
    user = request.user
    return Response({
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "date_added": user.date_added.isoformat(),
            "bannedAt": user.banned.isoformat() if user.banned else None
        }
    })