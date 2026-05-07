from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Admin configuration for custom User model."""

    list_display = ['username', 'email', 'is_active', 'is_staff', 'created_at']
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'created_at']
    search_fields = ['username', 'email']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at', 'password']

    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('id', 'created_at', 'updated_at')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
