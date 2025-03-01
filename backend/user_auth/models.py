from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# Кастомный менеджер пользователя
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email обязателен')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, blank=True, null=True, unique=True)  # Необязательное поле
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Новые поля
    insertedAt = models.DateTimeField(auto_now_add=True)  # Дата регистрации
    name = models.CharField(max_length=100, null=True, blank=True)  # Имя пользователя
    role = models.CharField(max_length=50, default='default')  # Роль пользователя
    banned = models.DateTimeField(null=True, blank=True)  # Дата бана (если есть)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

class PasswordResetRequest(models.Model):
    user = models.ForeignKey('user_auth.User', on_delete=models.CASCADE)  # Ссылка на кастомную модель User
    token = models.CharField(max_length=255, unique=True)  # Уникальный токен для сброса пароля
    created_at = models.DateTimeField(auto_now_add=True)  # Дата запроса на восстановление

    def __str__(self):
        return f"Password reset request for {self.user.email} at {self.created_at}"
