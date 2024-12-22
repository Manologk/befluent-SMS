from django.contrib import admin
from .models import Notification


# Register your models here.

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('type', 'recipient_email', 'sent_at', 'get_content_preview')
    list_filter = ('type', 'sent_at')
    search_fields = ('recipient_email', 'content')
    date_hierarchy = 'sent_at'
    readonly_fields = ('sent_at',)

    def get_content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content

    get_content_preview.short_description = 'Content Preview'
