import os
from datetime import timedelta
from pathlib import Path
from decouple import config
from dotenv import load_dotenv

DEBUG = True
APPEND_SLASH = False

BASE_URL = "http://localhost:8000"                # Базовый URL (для формирования полных ссылок на файлы и т.д.)

# Настройки для работы с загружаемыми файлами    
MAX_FILES = 25                                    # Допустимое Количество изображений на 1 объект недвижимости
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024    # Максимально допустимый размер файла для сервера (10 МБ)
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024    # Максимально допустимый размер загружаемого файла (10 МБ)
BASE_DIR = Path(__file__).resolve().parent.parent # Корневая директория проекта
MEDIA_URL = '/media/'                             # URL для доступа к медиафайлам
MEDIA_ROOT = BASE_DIR / 'media'                   # Физический путь к медиафайлам
TEMP_UPLOAD_DIR = MEDIA_ROOT / 'temp'             # Временная директория для загружаемых файлов
PROPERTY_MEDIA_DIR = MEDIA_ROOT / 'property'      # Директория для постоянного хранения файлов объектов недвижимости

# Настройки электронной почты (для отправки писем)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend' # TODO: Для локальных тестов SMTP ОК, но потом нужна боевая хрень.
SECRET_KEY = 'django-insecure-a@xs*#59&$q=s(2*#323k9q^5azx@c@4@d^67y35-#y-@4cy)p'

# Используем базу данных для сессий
SESSION_ENGINE = "django.contrib.sessions.backends.db"

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

    # Мои приложения (в порядке возможных зависимостей)
    'users',                        # Кастомная модель User, основа для других приложений
    'user_auth',                    # Зависит от users (предположительно)
    # 'catalog',
    'catalog.apps.CatalogConfig',
    'contacts',
    'file',
    'listings',                     
    # 'ai_assistant',                 # Может зависеть от users или user_auth
    # 'payments',                     # Платежи, может зависеть от users
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        # 'rest_framework_simplejwt.authentication.JWTAuthentication',
        # 'file.auth.BearerTokenAuthentication',
        "user_auth.auth.KillSwitchJWTAuthentication",
    ],

    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],

    # Пагинация
    'DEFAULT_PAGINATION_CLASS': 'catalog.utils.pagination.FrontendPagination',
    'PAGE_SIZE': 10,

    # Рендереры — чтобы API возвращал camelCase JSON
    'DEFAULT_RENDERER_CLASSES': (
        'djangorestframework_camel_case.render.CamelCaseJSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),

    # Парсеры — чтобы принимать camelCase JSON и multipart                   
    'DEFAULT_PARSER_CLASSES': (                                            
        'djangorestframework_camel_case.parser.CamelCaseJSONParser',       
        'djangorestframework_camel_case.parser.CamelCaseMultiPartParser',  
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": False,

    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": "",
    "AUDIENCE": None,
    "ISSUER": None,
    "JSON_ENCODER": None,
    "JWK_URL": None,
    "LEEWAY": 0,

    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",
    "ON_LOGIN_SUCCESS": "rest_framework_simplejwt.serializers.default_on_login_success",
    "ON_LOGIN_FAILED": "rest_framework_simplejwt.serializers.default_on_login_failed",

    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",

    "JTI_CLAIM": "jti",

    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),

    "TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
    "TOKEN_VERIFY_SERIALIZER": "rest_framework_simplejwt.serializers.TokenVerifySerializer",
    "TOKEN_BLACKLIST_SERIALIZER": "rest_framework_simplejwt.serializers.TokenBlacklistSerializer",
    "SLIDING_TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainSlidingSerializer",
    "SLIDING_TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSlidingSerializer",

    "CHECK_REVOKE_TOKEN": False,
    "REVOKE_TOKEN_CLAIM": "hash_password",
    "CHECK_USER_IS_ACTIVE": True,
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

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",
    },
}
