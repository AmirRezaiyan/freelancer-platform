from rest_framework.throttling import SimpleRateThrottle


class IPAddressRateThrottle(SimpleRateThrottle):
    def get_cache_key(self, request, view):
        client_ip = request.META.get("REMOTE_ADDR") or "unknown"
        return self.cache_format % {"scope": self.scope, "ident": client_ip}


class LoginRateThrottle(IPAddressRateThrottle):
    scope = "login"


class RegistrationRateThrottle(IPAddressRateThrottle):
    scope = "registration"


class TokenRefreshRateThrottle(IPAddressRateThrottle):
    scope = "token_refresh"