from rest_framework import serializers
from .models import UserProfile, Attendance, Leave, Holiday, Payslip

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.name')
    
    class Meta:
        model = Attendance
        fields = ['id', 'user', 'user_name', 'type', 'timestamp', 'lat', 'lng', 'photo']

class LeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = '__all__'

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'

class PayslipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payslip
        fields = '__all__'