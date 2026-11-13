from django.db import models
from django.contrib.auth.models import AbstractUser
from phonenumber_field.modelfields import PhoneNumberField
# Create your models here.

class Cuser(AbstractUser):
    phone_number = PhoneNumberField(blank=True, unique=True)
    USER_ROLES = [
        ("admin","Admin"),
        ("employee","Employee")
    ]
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20,choices=USER_ROLES,default='employee')

    def save(self,*args,**kwargs):
        if not self.pk:
            self.username=self.email
        super().save(*args,**kwargs)

    def __str__(self):
        return self.username

class Department(models.Model):
    # DEPARTMENT_NAMES = [
    #     ("HR","HUMAN RESOURCES"),
    #     ("Engg","ENgineering"),
    # ]
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Employee(models.Model):
    user = models.OneToOneField(Cuser,on_delete=models.SET_NULL,null=True)
    department = models.ForeignKey(Department,on_delete=models.SET_NULL,null=True,blank=True)
    designation = models.CharField(max_length=50,blank=True)
    salary = models.DecimalField(max_digits=10,decimal_places=2,blank=True,null=True)
    joining_date = models.DateField(blank=True,null=True)
    profile_pic = models.ImageField(upload_to='profile_pics/',null=True,blank=True)
    employee_id = models.CharField(null=True,blank=True)
    is_deleted = models.BooleanField(default=False)
    
    def save(self,*args,**kwargs):
        is_new = self.pk is None
        super().save(*args,**kwargs)

        if is_new and not self.employee_id:
            self.employee_id=f"EMP-{self.id:04d}"
            super().save(update_fields=["employee_id"])

    # def __str__(self):
    #     return f"{self.user.username}"