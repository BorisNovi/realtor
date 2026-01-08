from django.utils.deprecation import MiddlewareMixin

# Привязываем пользователя к сессии для дальнейшего управления сессиями
class AttachUserToSessionMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.user.is_authenticated:
            request.session["user_id"] = request.user.id
