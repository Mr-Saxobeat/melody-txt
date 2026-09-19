from django.contrib import admin
from .models import Instrument, Melody


@admin.register(Instrument)
class InstrumentAdmin(admin.ModelAdmin):
    list_display = ['name', 'pitch', 'offset']
    list_filter = ['pitch']
    search_fields = ['name']
    readonly_fields = ['id', 'offset']

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ['pitch']
        return self.readonly_fields


@admin.register(Melody)
class MelodyAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'key', 'note_count', 'is_public', 'created_at']
    list_filter = ['key', 'is_public', 'created_at']
    search_fields = ['title', 'notation']
    readonly_fields = ['id', 'share_id', 'note_count', 'duration_seconds', 'created_at', 'updated_at']
