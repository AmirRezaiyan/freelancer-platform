import hashlib

from django.contrib import admin
from django.core.cache import cache
from django.http import HttpResponse


ADMIN_LOGIN_LIMIT = 10
ADMIN_LOGIN_WINDOW_SECONDS = 60


def throttled_admin_login(request):
    if request.method == "POST":
        client_ip = request.META.get("REMOTE_ADDR") or "unknown"
        key_digest = hashlib.sha256(client_ip.encode("utf-8")).hexdigest()
        cache_key = f"admin-login:{key_digest}"

        if not cache.add(cache_key, 1, timeout=ADMIN_LOGIN_WINDOW_SECONDS):
            try:
                attempts = cache.incr(cache_key)
            except ValueError:
                cache.set(cache_key, 1, timeout=ADMIN_LOGIN_WINDOW_SECONDS)
                attempts = 1
            if attempts > ADMIN_LOGIN_LIMIT:
                return HttpResponse("Too many login attempts.", status=429)

    return admin.site.login(request)
