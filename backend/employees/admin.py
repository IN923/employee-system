from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import AbstractUser
from .models import Cuser,Employee,Department
# Register your models here.

abstract_fields = {f.name for f in AbstractUser._meta.get_fields()}
custom_fields = tuple(
    f.name for f in Cuser._meta.fields
    if f.name not in abstract_fields and f.editable and not f.primary_key
)

@admin.register(Cuser)
class CuserAdmin(UserAdmin):
    model = Cuser

    fieldsets = UserAdmin.fieldsets + (
        ("Employee Details", {"fields": custom_fields}),
    )

    # Fields shown immediately on the "Add cuser" (creation) page
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Personal Info", {"fields": ("first_name", "last_name", "email")}),
        ("Employee Details", {"fields": custom_fields}),
    )

admin.site.register(Employee)
admin.site.register(Department)