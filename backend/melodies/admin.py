from django.contrib import admin
from .models import Melody


@admin.register(Melody)
class MelodyAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'key', 'note_count', 'is_public', 'created_at']
    list_filter = ['key', 'is_public', 'created_at']
    search_fields = ['title', 'notation']
    readonly_fields = ['id', 'share_id', 'note_count', 'duration_seconds', 'created_at', 'updated_at']
