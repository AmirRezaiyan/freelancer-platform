from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.views.static import serve
from pathlib import Path
from rest_framework_simplejwt.views import TokenRefreshView
from .throttles import TokenRefreshRateThrottle
from .admin_views import throttled_admin_login

urlpatterns = [
    path('admin/login/', throttled_admin_login),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/market/', include('marketplace.urls')),
    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(throttle_classes=[TokenRefreshRateThrottle]),
        name='token_refresh',
    ),
]

if settings.DEBUG:
    urlpatterns += [
        path(
            'media/avatars/<path:path>',
            serve,
            {'document_root': Path(settings.MEDIA_ROOT) / 'avatars'},
        ),
        path(
            'media/portfolio/<path:path>',
            serve,
            {'document_root': Path(settings.MEDIA_ROOT) / 'portfolio'},
        ),
    ]
