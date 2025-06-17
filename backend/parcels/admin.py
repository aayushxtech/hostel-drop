from django.contrib import admin
from .models import Parcel


@admin.register(Parcel)
class ParcelAdmin(admin.ModelAdmin):
    list_display = ['tracking_id', 'get_student_name',
                    'service', 'status', 'created_at']
    list_filter = ['status', 'service', 'created_at']
    search_fields = ['tracking_id', 'student__name',
                     'student__email', 'service']
    readonly_fields = ['tracking_id', 'created_at']
    ordering = ['-created_at']

    def get_student_name(self, obj):
        return obj.student.name if obj.student else "N/A"

    get_student_name.short_description = 'Student Name'
    get_student_name.admin_order_field = 'student__name'

    fieldsets = (
        ('Parcel Information', {
            'fields': ('tracking_id', 'student', 'service', 'description')
        }),
        ('Status & Timing', {
            'fields': ('status', 'created_at', 'picked_up_time')
        }),
        ('Additional', {
            'fields': ('image',),
            'classes': ('collapse',)
        })
    )
