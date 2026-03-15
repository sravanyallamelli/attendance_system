from django.contrib import admin
from django.urls import path
# Make sure StaffDetailView and StaffListCreateView are in this list
from attendance.views import (
    LoginView, 
    AttendanceView, 
    AdminSummaryView, 
    StaffListCreateView, 
    StaffDetailView, 
    LeaveView, 
    ReportsView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view()),
    path('api/attendance/', AttendanceView.as_view()),
    path('api/admin/staff/', StaffListCreateView.as_view()),
    path('api/leaves/', LeaveView.as_view()),
    path('api/admin/reports/', ReportsView.as_view()),
    path('api/admin/summary/', AdminSummaryView.as_view()),
]