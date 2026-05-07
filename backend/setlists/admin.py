from django.contrib import admin
from .models import Setlist, SetlistEntry


class SetlistEntryInline(admin.TabularInline):
    model = SetlistEntry
    extra = 0
    readonly_fields = ['id', 'added_at']


@admin.register(Setlist)
class SetlistAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'is_public', 'created_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['title']
    readonly_fields = ['id', 'share_id', 'created_at', 'updated_at']
    inlines = [SetlistEntryInline]
