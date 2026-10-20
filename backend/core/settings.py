import os
from pathlib import Path
from datetime import timedelta
from urllib.parse import parse_qsl, unquote, urlsplit

from dotenv import load_dotenv
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')


def _parse_bool(value, setting_name):
    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    raise ImproperlyConfigured(f"{setting_name} must be a boolean value.")


def build_security_settings(environment):
    configured_environment = environment.get("DJANGO_ENV", "production")
    environment_name = configured_environment.strip().lower()
    if environment_name not in {"development", "production"}:
        raise ImproperlyConfigured("DJANGO_ENV must be development or production.")

    is_production = environment_name == "production"
    secret_key = environment.get("SECRET_KEY", "").strip()
    if not secret_key:
        if is_production:
            raise ImproperlyConfigured("SECRET_KEY is required in production.")
        secret_key = "development-only-insecure-key-not-for-production"
    if is_production and (
        len(secret_key) < 50
        or len(set(secret_key)) < 16
        or "development-only" in secret_key.lower()
        or "change-this" in secret_key.lower()
    ):
        raise ImproperlyConfigured("Production SECRET_KEY must be a unique secret of at least 50 characters.")

    debug_value = environment.get("DEBUG", "False" if is_production else "True")
    debug = _parse_bool(debug_value, "DEBUG")
    if is_production and debug:
        raise ImproperlyConfigured("DEBUG cannot be enabled in production.")

    host_value = environment.get("ALLOWED_HOSTS", "" if is_production else "127.0.0.1,localhost")
    allowed_hosts = [host.strip() for host in host_value.split(",") if host.strip()]
    if is_production and (not allowed_hosts or "*" in allowed_hosts):
        raise ImproperlyConfigured("Production ALLOWED_HOSTS must list explicit hosts.")

    origin_value = environment.get(
        "CORS_ALLOWED_ORIGINS",
        "" if is_production else "http://localhost:5173,http://127.0.0.1:5173",
    )
    cors_allowed_origins = [origin.strip().rstrip("/") for origin in origin_value.split(",") if origin.strip()]
    if is_production and not cors_allowed_origins:
        raise ImproperlyConfigured("CORS_ALLOWED_ORIGINS must be configured in production.")
    for origin in cors_allowed_origins:
        parsed = urlsplit(origin)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.path or parsed.query or parsed.fragment:
            raise ImproperlyConfigured("CORS_ALLOWED_ORIGINS must contain origin URLs without paths.")
        if is_production and parsed.scheme != "https":
            raise ImproperlyConfigured("Production CORS origins must use HTTPS.")

    credential_default = "False"
    allow_credentials = _parse_bool(
        environment.get("CORS_ALLOW_CREDENTIALS", credential_default),
        "CORS_ALLOW_CREDENTIALS",
    )
    if is_production and allow_credentials:
        raise ImproperlyConfigured("CORS_ALLOW_CREDENTIALS must be disabled in production for JWT bearer authentication.")

    rate_limit_cache_url = environment.get("RATE_LIMIT_CACHE_URL", "").strip()
    database_url = environment.get("DATABASE_URL", "").strip()
    if is_production:
        database = urlsplit(database_url)
        if database.scheme not in {"postgres", "postgresql"} or not database.hostname or not database.path.strip("/"):
            raise ImproperlyConfigured("Production DATABASE_URL must point to a PostgreSQL database.")
    private_media_root = environment.get("PRIVATE_MEDIA_ROOT", "").strip()
    if is_production:
        cache_url = urlsplit(rate_limit_cache_url)
        if cache_url.scheme not in {"redis", "rediss"} or not cache_url.netloc:
            raise ImproperlyConfigured("Production requires RATE_LIMIT_CACHE_URL pointing to shared Redis.")
        if not private_media_root or not Path(private_media_root).is_absolute():
            raise ImproperlyConfigured("Production requires an absolute PRIVATE_MEDIA_ROOT outside public media.")
        private_path = Path(private_media_root).expanduser().resolve()
        public_path = (BASE_DIR / "media").resolve()
        try:
            private_path.relative_to(public_path)
        except ValueError:
            pass
        else:
            raise ImproperlyConfigured("PRIVATE_MEDIA_ROOT must not be inside the public MEDIA_ROOT.")

    return {
        "SECRET_KEY": secret_key,
        "DEBUG": debug,
        "ALLOWED_HOSTS": allowed_hosts,
        "CORS_ALLOWED_ORIGINS": cors_allowed_origins,
        "CORS_ALLOW_CREDENTIALS": allow_credentials,
        "RATE_LIMIT_CACHE_URL": rate_limit_cache_url,
        "DATABASE_URL": database_url,
        "PRIVATE_MEDIA_ROOT": private_media_root or str(BASE_DIR / "private_media"),
    }


SECURITY_SETTINGS = build_security_settings(os.environ)
SECRET_KEY = SECURITY_SETTINGS["SECRET_KEY"]
DEBUG = SECURITY_SETTINGS["DEBUG"]
ALLOWED_HOSTS = SECURITY_SETTINGS["ALLOWED_HOSTS"]
CORS_ALLOWED_ORIGINS = SECURITY_SETTINGS["CORS_ALLOWED_ORIGINS"]
CORS_ALLOW_CREDENTIALS = SECURITY_SETTINGS["CORS_ALLOW_CREDENTIALS"]
IS_PRODUCTION = os.getenv("DJANGO_ENV", "production" if not DEBUG else "development").strip().lower() == "production"
RATE_LIMIT_CACHE_URL = SECURITY_SETTINGS["RATE_LIMIT_CACHE_URL"]
PRIVATE_MEDIA_ROOT = SECURITY_SETTINGS["PRIVATE_MEDIA_ROOT"]

if IS_PRODUCTION:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": RATE_LIMIT_CACHE_URL,
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "freelancer-platform-development",
        }
    }

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'users',
    'marketplace',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

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

WSGI_APPLICATION = 'core.wsgi.application'

def build_database_settings(database_url, production=False):
    if not database_url:
        if production:
            raise ImproperlyConfigured("DATABASE_URL is required in production.")
        return {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}

    parsed = urlsplit(database_url)
    if parsed.scheme == "sqlite":
        if production:
            raise ImproperlyConfigured("Production DATABASE_URL must use PostgreSQL.")
        database_name = unquote(parsed.path)
        if database_name.startswith("//"):
            database_name = database_name[1:]
        else:
            database_name = database_name.lstrip("/")
            database_name = str(BASE_DIR / database_name)
        if not database_name:
            raise ImproperlyConfigured("SQLite DATABASE_URL must include a database path.")
        return {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": database_name}}

    if parsed.scheme not in {"postgres", "postgresql"} or not parsed.hostname or not parsed.path.strip("/"):
        raise ImproperlyConfigured("DATABASE_URL must be a valid SQLite or PostgreSQL URL.")

    options = dict(parse_qsl(parsed.query))
    return {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": unquote(parsed.path.lstrip("/")),
            "USER": unquote(parsed.username or ""),
            "PASSWORD": unquote(parsed.password or ""),
            "HOST": parsed.hostname,
            "PORT": parsed.port or "",
            "OPTIONS": options,
        }
    }


DATABASES = build_database_settings(SECURITY_SETTINGS["DATABASE_URL"], IS_PRODUCTION)

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8}
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
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
FILE_UPLOAD_MAX_MEMORY_SIZE = 2_621_440

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'users.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'login': '5/minute',
        'registration': '10/hour',
        'token_refresh': '30/minute',
    },
    'DEFAULT_PAGINATION_CLASS': 'core.pagination.DefaultPageNumberPagination',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
}

CORS_ALLOW_ALL_ORIGINS = False

SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_HTTPONLY = False
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG
SECURE_SSL_REDIRECT = not DEBUG
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
X_FRAME_OPTIONS = 'DENY'

if DEBUG:
    CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
else:
    CSRF_TRUSTED_ORIGINS = [
        origin.strip().rstrip("/")
        for origin in os.getenv("CSRF_TRUSTED_ORIGINS", ",".join(CORS_ALLOWED_ORIGINS)).split(",")
        if origin.strip()
    ]