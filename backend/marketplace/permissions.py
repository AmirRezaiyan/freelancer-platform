from rest_framework.permissions import BasePermission
from rest_framework import permissions

class IsClient(BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "user_type", None) == "client"
        )

class IsFreelancer(BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "user_type", None) == "freelancer"
        )

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return getattr(obj, "freelancer_id", None) == getattr(request.user, "pk", None)

class IsOwner(permissions.BasePermission):
    
    def has_object_permission(self, request, view, obj):
        try:
            owner = getattr(obj, "client", None)
            return bool(request.user and request.user.is_authenticated and owner == request.user)
        except Exception:
            return False
