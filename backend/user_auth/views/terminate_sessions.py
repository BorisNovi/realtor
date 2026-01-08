from django.contrib.sessions.models import Session
from django.contrib.auth import logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions
from user_auth.models import UserSession

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout_all(request):
    user = request.user

    # Берём ключи сессий юзера
    keys = UserSession.objects.filter(user=user).values_list("session_key", flat=True)

    # Удаляем сессии из django_session одним запросом
    Session.objects.filter(session_key__in=keys).delete()

    # Чистим нашу таблицу
    UserSession.objects.filter(user=user).delete()

    # Завершаем текущую сессию
    logout(request)

    return Response({"message": "all sessions have been terminated"}, status=200)
