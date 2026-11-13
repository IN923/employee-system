
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db.models import Count, Q
from .models import Employee, Department
from .serializers import EmployeeSerializer,EmployeeProfileSerializer,EmployeeListSerializer,DepartmentSerializer,ReadEmployeeData,EmployeeUpdateSerializer,EmployeeCreateSerializer
from .permissions import IsAdminRole, IsEmployeeRole

from .pagination import EmployeePagination
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from django.http import FileResponse
from io import BytesIO


class EmployeeListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):

        employees = Employee.objects.filter(
            is_deleted=False
        ).select_related("user", "department")

        search_terms = request.query_params.get("search", "").split()
        for term in search_terms:
            employees = employees.filter(
                Q(user__first_name__icontains=term)
                | Q(user__last_name__icontains=term)
            )

        # Department filter
        department = request.query_params.get('department')

        if department:
            employees = employees.filter(
                department__id=department
            )

        # Pagination
        paginator = EmployeePagination()

        paginated_employees = paginator.paginate_queryset(
            employees,
            request
        )

        # Get departments
        departments = Department.objects.values_list(
            'name',
            flat=True
        )

        serializer = EmployeeListSerializer(
            paginated_employees,
            many=True
        )

        return paginator.get_paginated_response({
            'success': True,
            'department_data': list(departments),
            'employee_data': serializer.data
        })

    def post(self, request):

        serializer = EmployeeCreateSerializer(
            data=request.data
        )

        if serializer.is_valid():
            employee = serializer.save()

            response_serializer = EmployeeSerializer(employee)

            return Response({
                'success': True,
                'message': 'Employee created successfully.',
                'employee_data': response_serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

# GET Employee Details and PUT Update Employee
class EmployeeDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    # GET Employee Details
    def get(self, request, id):

        try:
            employee_detail = Employee.objects.get(
                pk=id,
                is_deleted=False
            )

        except Employee.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Employee not found'
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            serializer = ReadEmployeeData(employee_detail)

            return Response({
                'success': True,
                'message': 'Employee details fetched successfully',
                'employee_detail': serializer.data
            }, status=status.HTTP_200_OK)

        except Exception:
            print("Error fetching employee details")

            return Response({
                'success': False,
                'message': 'Error fetching employee details'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # PUT Update Employee
    def put(self, request, id):

        try:
            employee = Employee.objects.get(
                pk=id,
                is_deleted=False
            )

        except Employee.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Employee not found'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = EmployeeUpdateSerializer(
            employee,
            data=request.data
        )

        if serializer.is_valid():

            try:
                serializer.save()

                return Response({
                    'success': True,
                    'message': 'Employee updated successfully',
                    'employee_detail': serializer.data
                }, status=status.HTTP_200_OK)

            except Exception:
                print("Error updating employee")

                return Response({
                    'success': False,
                    'message': 'Something went wrong while updating employee'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'success': False,
            'message': 'Invalid employee data',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):

        if not request.user.is_staff:
            return Response(
                {"message": "You do not have permission to delete employees."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            employee = Employee.objects.get(
                pk=id,
                is_deleted=False
            )

        except Employee.DoesNotExist:
            return Response(
                {"message": "Employee not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        employee.is_deleted = True
        employee.save(update_fields=["is_deleted"])

        return Response(
            {"message": "Employee deleted successfully."},
            status=status.HTTP_200_OK
        )

# GET All Departments
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminRole])
def get_departments(request):

    departments = Department.objects.all().order_by('name')

    serializer = DepartmentSerializer(
        departments,
        many=True
    )

    return Response({
        'success': True,
        'department_data': serializer.data
    }, status=status.HTTP_200_OK)

class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):

        # 1. Total employees
        total_employees = Employee.objects.filter(is_deleted=False).count()

        # 2. Total departments
        total_departments = Department.objects.count()

        # 3. Recently added employees (latest 5)
        recent_employees = Employee.objects.select_related(
            "user", "department"
        ).order_by("-id")[:5]

        recent_employee_data = ReadEmployeeData(
            recent_employees,
            many=True,
            context={"request": request}
        ).data

        # 4. Department-wise employee count
        department_statistics = Department.objects.annotate(
            employee_count=Count("employee")
        ).values(
            "id",
            "name",
            "employee_count"
        )

        return Response({
            "success": True,
            "message": "Dashboard data fetched successfully.",
            "dashboard_data": {
                "total_employees": total_employees,
                "total_departments": total_departments,
                "recent_employees": recent_employee_data,
                "department_statistics": list(department_statistics),
            }
        }, status=status.HTTP_200_OK)

class ExportEmployeeExcelAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        # Get all active employees
        employees = Employee.objects.select_related(
            "user",
            "department"
        ).filter(
            is_deleted=False
        ).order_by("id")

        workbook = Workbook()
        worksheet = workbook.active
        worksheet.title = "Employees"

        # Headers
        headers = [
            "S.No",
            "Employee ID",
            "First name",
            "Last name",
            "Email",
            "Phone Number",
            "Department",
            "Designation",
            "Salary",
            "Joining Date",
        ]

        worksheet.append(headers)

        # Header styling
        for cell in worksheet[1]:
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = PatternFill(
                start_color="2563EB",
                end_color="2563EB",
                fill_type="solid"
            )
            cell.alignment = Alignment(horizontal="center")

        # Employee records
        for index, employee in enumerate(employees, start=1):

            user = employee.user

            worksheet.append([
                index,
                employee.employee_id or "",
                user.first_name if user else "",
                user.last_name if user else "",
                user.email if user else "",
                str(user.phone_number or "") if user else "",
                employee.department.name if employee.department else "",
                employee.designation,
                float(employee.salary) if employee.salary is not None else "",
                employee.joining_date.strftime("%Y-%m-%d") if employee.joining_date else "",
            ])

        # Adjust column widths
        for column in worksheet.columns:
            max_length = max(
                len(str(cell.value or ""))
                for cell in column
            )

            worksheet.column_dimensions[
                column[0].column_letter
            ].width = max_length + 4

        worksheet.freeze_panes = "A2"

        # Generate Excel file in memory
        excel_file = BytesIO()
        workbook.save(excel_file)
        excel_file.seek(0)

        return FileResponse(
            excel_file,
            as_attachment=True,
            filename="Employee_Data.xlsx",
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsEmployeeRole])
def employee_profile(request):

    try:
        employee = Employee.objects.select_related(
            "user",
            "department"
        ).get(user=request.user, is_deleted=False)

        serializer = EmployeeProfileSerializer(
            employee,
            context={"request": request}
        )

        return Response({
            "success": True,
            "profile": serializer.data
        }, status=status.HTTP_200_OK)

    except Employee.DoesNotExist:
        return Response({
            "success": False,
            "message": "Employee profile not found"
        }, status=status.HTTP_404_NOT_FOUND)