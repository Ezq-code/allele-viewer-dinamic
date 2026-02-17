from django.contrib import admin

from apps.users_app.models.country import Country
from apps.users_app.models.system_user import SystemUser


@admin.register(SystemUser)
class SystemUserAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "internal_status",
    ]
    fields = [
        "username",
        "email",
        "first_name",
        "last_name",
        "internal_status",
    ]


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    empty_value_display = "-empty-"
    list_display = [
        "id",
        "name",
        "code",
        "enabled",
    ]
    fields = [
        "name",
        "code",
        "enabled",
    ]
    search_fields = ["name", "code"]
