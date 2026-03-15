from django.contrib import admin
from .models import UserProfile, Attendance, Leave, Holiday, Payslip

# Using the decorator automatically registers the model
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'mobile', 'role', 'status')
    search_fields = ('name', 'mobile')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'timestamp')

# Register others simply
admin.site.register(Leave)
admin.site.register(Holiday)
admin.site.register(Payslip)

# CRITICAL: REMOVE any line at the bottom that looks like:
# admin.site.register(UserProfile) <--- DELETE THIS IF IT EXISTS