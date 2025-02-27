from django.db import models
from django.contrib.auth.models import User

class PasswordResetRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Связь с пользователем
    token = models.CharField(max_length=255, unique=True)  # Уникальный токен для сброса пароля
    created_at = models.DateTimeField(auto_now_add=True)  # Дата запроса на восстановление

    def __str__(self):
        return f"Password reset request for {self.user.username} at {self.created_at}"
