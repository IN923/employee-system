from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    message = "Only administrators can access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )


class IsEmployeeRole(BasePermission):
    message = "Only employees can access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "employee"
        )