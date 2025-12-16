from rest_framework.permissions import BasePermission
from rest_framework import permissions

class IsClient(BasePermission):
    
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and request.user.user_type == "client"
        return True

class IsFreelancer(BasePermission):

    def has_object_permission(self, request, view, obj):
        return obj.freelancer == request.user

class IsOwner(permissions.BasePermission):
    
    def has_object_permission(self, request, view, obj):
        try:
            owner = getattr(obj, "client", None)
            return bool(request.user and request.user.is_authenticated and owner == request.user)
        except Exception:
            return False
