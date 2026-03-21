from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

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
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, max_length=255)
    username = models.CharField(max_length=255, blank=True, unique=True, null=True)
    first_name = models.CharField(max_length=30, blank=True, default='')
    last_name = models.CharField(max_length=30, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True)
    
    company_name = models.CharField(max_length=255, blank=True)
    company_logo = models.URLField(max_length=500, blank=True)
    marketing_consent1 = models.BooleanField(default=True)
    marketing_consent2 = models.BooleanField(default=True)

    role = models.CharField(max_length=50, default='default')
    banned_at = models.DateTimeField(null=True, blank=True)
    last_logout_at = models.DateTimeField(null=True, blank=True)
    date_added = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] # Email и пароль обязательны по умолчанию, но также можно добавить другие поля, если нужно. 

    def __str__(self):
        return self.email

    @property
    def is_banned(self):
        return self.banned_at is not None


class PasswordResetRequest(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)  
    token = models.CharField(max_length=255, unique=True)  
    created_at = models.DateTimeField(auto_now_add=True) 

    def __str__(self):
        return f"Password reset request for {self.user.email} at {self.created_at}"
