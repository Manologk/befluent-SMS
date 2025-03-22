from rest_framework import permissions
from functools import wraps
from django.core.exceptions import PermissionDenied

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin

class IsInstructor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_instructor

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_student

class IsParent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_parent

def role_required(roles):
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(request, *args, **kwargs):
            if not request.user.is_authenticated:
                raise PermissionDenied("Authentication required")
            
            if isinstance(roles, str):
                required_roles = [roles]
            else:
                required_roles = roles

            if request.user.role not in required_roles:
                raise PermissionDenied("You don't have permission to access this resource")
            
            return view_func(request, *args, **kwargs)
        return wrapped
    return decorator
