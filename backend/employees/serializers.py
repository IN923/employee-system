from rest_framework import serializers
from .models import Cuser,Employee,Department

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # data["user"] = {
        #     "id": self.user.id,
        #     "username": self.user.username,
        #     "email": self.user.email,
        #     "is_staff": self.user.is_staff,
        # }
        data["user"]={
            "role":self.user.role,
        }   
        data["message"] = "Login successful"

        return data

class CuserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    class Meta:
        model = Cuser
        fields = ['fullname']

    def get_full_name(self,obj):
        return obj.get_full_name()

class EmployeeSerializer(serializers.ModelSerializer):
    department = serializers.CharField(
        source='department.name'
    )

    class Meta:
        model = Employee
        fields = ['id','employee_id','department','designation','salary','joining_date','profile_pic']

class EmployeeListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(
        source='user.email',
        read_only=True,
        allow_null=True
    )
    department = serializers.CharField(
        source='department.name',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Employee
        fields = [
            'id',
            'full_name',
            'email',
            'employee_id',
            'department',
            'designation',
            'salary',
            'joining_date',
        ]

    def get_full_name(self, obj):
        if not obj.user:
            return ""
        return obj.user.get_full_name() or obj.user.email

class EmployeeProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)
    phone_number = serializers.CharField(
        source='user.phone_number',
        read_only=True,
        allow_blank=True
    )
    department = serializers.CharField(
        source='department.name',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Employee
        fields = [
            'full_name',
            'email',
            'phone_number',
            'employee_id',
            'department',
            'designation',
            'salary',
            'joining_date',
            'profile_pic',
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.email

class ReadEmployeeData(serializers.ModelSerializer):
    class Meta:
            model = Employee
            fields = '__all__'

class EmployeeUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Employee
        fields = [
            'user',
            'department',
            'designation',
            'salary',
            'joining_date',
            'profile_pic'
        ]

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id','name']

class EmployeeCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField()
    phone_number = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)

    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        required=False,
        allow_null=True
    )
    designation = serializers.CharField(required=False, allow_blank=True)
    salary = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    joining_date = serializers.DateField(required=False, allow_null=True)
    profile_pic = serializers.ImageField(required=False, allow_null=True)

    def validate_email(self, value):
        if Cuser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate_phone_number(self, value):
        if value and Cuser.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Phone number already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')

        user_data = {
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name', ''),
            'email': validated_data.pop('email'),
            'phone_number': validated_data.pop('phone_number', ''),
            # 'role': 'employee',
        }

        user = Cuser(**user_data)
        user.username = user.email
        user.set_password(password)
        user.save()

        employee = Employee.objects.create(
            user=user,
            **validated_data
        )

        return employee
