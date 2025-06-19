from datetime import timedelta
from pathlib import Path
import os
from decouple import config
from dotenv import load_dotenv

APPEND_SLASH = False

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend' # Для локальных тестов SMTP (например для проверки отправки писем для сброса пароля)

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-a@xs*#59&$q=s(2*#323k9q^5azx@c@4@d^67y35-#y-@4cy)p'

ALLOWED_HOSTS = ['*']

# Загружаем .env файл
ENV_FILE = BASE_DIR / ".env"
print(f"Загружаем файл: {ENV_FILE}")
load_dotenv(ENV_FILE)

# Читаем переменные из .env
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")  # Если Redis не используется, то localhost
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
USE_REDIS = os.getenv("USE_REDIS", "False") == "True"  # Проверка, используется ли Redis

print(f"REDIS_HOST: {REDIS_HOST}")
print(f"USE_REDIS: {USE_REDIS}")

# Условное подключение Redis
if USE_REDIS:
    # Используем Redis
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": f"redis://{REDIS_HOST}:{REDIS_PORT}/1",
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            }
        }
    }
    print("Redis is enabled.")
else:
    # Используем локальный кэш, если Redis не используется
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        }
    }
    print("Redis is not enabled. Using local cache.")

DEBUG = True

INSTALLED_APPS = [
    # Встроенные приложения Django (основные зависимости сначала)
    'django.contrib.contenttypes',  # Нужен для auth и других
    'django.contrib.auth',          # Аутентификация, основа для admin и кастомной модели
    'django.contrib.admin',         # Админка зависит от auth
    'django.contrib.sessions',      # Сессии
    'django.contrib.messages',      # Сообщения
    'django.contrib.staticfiles',   # Статические файлы

    # Сторонние библиотеки
    'rest_framework',               # DRF должен быть перед своими дополнениями
    'rest_framework_simplejwt',     # JWT зависит от rest_framework
    'rest_framework_simplejwt.token_blacklist',  # Blacklist зависит от simplejwt
    'corsheaders',                  # CORS для API, независим

    # Ваши приложения (в порядке возможных зависимостей)
    'users',                        # Кастомная модель User, основа для других приложений
    'user_auth',                    # Зависит от users (предположительно)
    'catalog',
    "contacts",                     
    # 'ai_assistant',                 # Может зависеть от users или user_auth
    # 'listings',                     # Листинги, возможно, зависят от users
    # 'map',                          # Карта, может зависеть от listings или users
    # 'payments',                     # Платежи, может зависеть от users
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),

    'DEFAULT_RENDERER_CLASSES': [
        'realtor.utils.renderers.CamelCaseJSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],

    'DEFAULT_PARSER_CLASSES': [
        'realtor.utils.parsers.CamelCaseJSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],

    'DEFAULT_PAGINATION_CLASS': 'catalog.utils.pagination.FrontendPagination',
    'PAGE_SIZE': 10,
    
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),  # Access-токен живёт 15 минут
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),     # Refresh-токен живёт 7 дней
    "ROTATE_REFRESH_TOKENS": True,                   # Новый refresh-токен при каждом обновлении
    "BLACKLIST_AFTER_ROTATION": True,                # Старый refresh-токен аннулируется
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
#     "AUTH_TOKEN_CLASSES": (
#     "rest_framework_simplejwt.tokens.AccessToken",
#     "rest_framework_simplejwt.tokens.RefreshToken",
# ),
    "TOKEN_BLACKLIST_ENABLED": True,                 # Включаем Blacklist
}

AUTH_USER_MODEL = 'users.User'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'realtor.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'realtor.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DATABASE_NAME', default='2testdb'), # Проверь нахуй .енв в следующий раз когда будут беды с базами
        'USER': config('DATABASE_USER', default='postgres'),
        'PASSWORD': config('DATABASE_PASSWORD', default='admin'),
        'HOST': config('DATABASE_HOST', default='localhost'),
        'PORT': config('DATABASE_PORT', default='5432'),
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Настройки CORS
# CORS_ALLOW_ALL_ORIGINS = True # Только для дебага. Удалить при поднятии на прод

CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "origin",
    "x-csrftoken",
]