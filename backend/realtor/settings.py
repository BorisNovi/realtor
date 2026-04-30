import os
from datetime import timedelta
from pathlib import Path
from decouple import config
from dotenv import load_dotenv

# Корневая директория проекта
BASE_DIR = Path(__file__).resolve().parent.parent

# Загружаем .env файл
ENV_FILE = BASE_DIR / ".env"
load_dotenv(ENV_FILE)

MAX_ROWS = 1000 # Максимальное количество строк в импортируемой CSV.

# Окружение: development | staging | production
ENVIRONMENT = config('ENVIRONMENT', default='development')

DEBUG = config('DEBUG', default=False, cast=bool)
SECRET_KEY = config('SECRET_KEY')
BASE_URL = config('BASE_URL', default='http://localhost:8000')
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:4200')
APPEND_SLASH = False

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# Настройки для работы с загружаемыми файлами
MAX_FILES = 25                                    # Допустимое Количество изображений на 1 объект недвижимости
MAX_FILE_SIZE = 10 * 1024 * 1024                       # Максимальный размер одного файла (10 МБ)
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024    # Максимально допустимый размер файла для сервера (10 МБ)
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024    # Максимально допустимый размер загружаемого файла (10 МБ)
MEDIA_URL = '/uploads/'                           # URL для медиафайлов (/media/ занят Angular-ассетами шрифтов/иконок)
MEDIA_ROOT = BASE_DIR / 'media'                   # Физический путь к медиафайлам
TEMP_UPLOAD_DIR = MEDIA_ROOT / 'temp'             # Временная директория для загружаемых файлов
PROPERTY_MEDIA_DIR = MEDIA_ROOT / 'property'      # Директория для постоянного хранения файлов объектов недвижимости

# Настройки электронной почты
EMAIL_BACKEND = config(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.console.EmailBackend'
)
EMAIL_HOST = config('EMAIL_HOST', default='')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@example.com')

# Используем базу данных для сессий
SESSION_ENGINE = "django.contrib.sessions.backends.db"

# Security-настройки — включаются только когда DEBUG=False (staging и production)
if not DEBUG:
    # Nginx принимает HTTPS и проксирует Django как HTTP.
    # Эта настройка говорит Django: доверяй заголовку X-Forwarded-Proto от nginx,
    # чтобы понимать, что исходный запрос был по HTTPS. Без этого — бесконечный редирект.
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_HSTS_SECONDS = 31536000          # Браузер запоминает: только HTTPS, 1 год
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True   # Распространяется на поддомены
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)  # Отключать для local-prod тестирования
    SESSION_COOKIE_SECURE = True            # Cookie сессии только по HTTPS
    CSRF_COOKIE_SECURE = True               # CSRF cookie только по HTTPS
    SECURE_CONTENT_TYPE_NOSNIFF = True      # Запрет на угадывание MIME-типа браузером

# Читаем переменные Redis из .env
REDIS_HOST = config('REDIS_HOST', default='localhost')
REDIS_PORT = config('REDIS_PORT', default=6379, cast=int)
REDIS_PASSWORD = config('REDIS_PASSWORD', default=None)
USE_REDIS = config('USE_REDIS', default=False, cast=bool)

# Условное подключение Redis
if USE_REDIS:
    _redis_location = (
        f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/1"
        if REDIS_PASSWORD
        else f"redis://{REDIS_HOST}:{REDIS_PORT}/1"
    )
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": _redis_location,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            }
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        }
    }


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
    'countries',
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
    # BrowsableAPIRenderer доступен только на development и staging
    'DEFAULT_RENDERER_CLASSES': (
        ('djangorestframework_camel_case.render.CamelCaseJSONRenderer',
         'rest_framework.renderers.BrowsableAPIRenderer',)
        if ENVIRONMENT in ('development', 'staging')
        else ('djangorestframework_camel_case.render.CamelCaseJSONRenderer',)
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
        'NAME': config('DATABASE_NAME'),
        'USER': config('DATABASE_USER'),
        'PASSWORD': config('DATABASE_PASSWORD'),
        'HOST': config('DATABASE_HOST', default='localhost'),
        'PORT': config('DATABASE_PORT', default='5432'),
        'ATOMIC_REQUESTS': True,
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        } 
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
STATIC_ROOT = BASE_DIR / 'staticfiles'  # Куда collectstatic складывает файлы (nginx раздаёт из этой папки)
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Настройки CORS
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:4200,http://127.0.0.1:4200'
).split(',')
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
        # На development выводим всё, на staging/production только WARNING и выше
        "level": "DEBUG" if ENVIRONMENT == 'development' else "WARNING",
    },
}
