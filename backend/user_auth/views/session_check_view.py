from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def check_session(request):
    user = request.user
    return Response({
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "date_added": user.date_added.isoformat(),
            "banned_at": user.banned_at.isoformat() if user.banned_at else None
        }
    })
