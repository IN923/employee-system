
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from .views import EmployeeListAPIView,get_departments,EmployeeDetailView,DashboardAPIView,ExportEmployeeExcelAPIView,employee_profile

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view()),
    path('employees/',EmployeeListAPIView.as_view()),
    path('departments/',get_departments),
    path('employees/<int:id>/',EmployeeDetailView.as_view()),
    path("dashboard/", DashboardAPIView.as_view()),
    path(
        "employees/export/",
        ExportEmployeeExcelAPIView.as_view(),
        name="export-employees"
    ),
    path("employee/profile/", employee_profile, name="employee-profile"),
]
