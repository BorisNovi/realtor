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
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    name = models.CharField(max_length=100, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    company_logo = models.URLField(max_length=500, blank=True)
    
    role = models.CharField(max_length=50, default='default')
    banned_at = models.DateTimeField(null=True, blank=True)
    last_logout_at = models.DateTimeField(null=True, blank=True)
    date_added = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

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
