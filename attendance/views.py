from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import UserProfile, Attendance, Leave, Holiday
from .serializers import UserProfileSerializer, AttendanceSerializer
from django.utils import timezone
from rest_framework import generics, status  # Add 'generics' here

class LoginView(APIView):
    def post(self, request):
        mobile = request.data.get('mobile')
        try:
            user = UserProfile.objects.get(mobile=mobile, status='active')
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_401_UNAUTHORIZED)

class AttendanceView(APIView):
    def post(self, request):
        mobile = request.data.get('mobile')
        try:
            user = UserProfile.objects.get(mobile=mobile)
            Attendance.objects.create(
                user=user,
                type=request.data.get('type'),
                lat=request.data.get('lat'),
                lng=request.data.get('lng'),
                photo=request.data.get('photo')
            )
            return Response({"success": True})
        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class AdminSummaryView(APIView):
    def get(self, request):
        today = timezone.now().date()
        total_staff = UserProfile.objects.filter(role='staff', status='active')
        present_ids = Attendance.objects.filter(timestamp__date=today, type='IN').values_list('user_id', flat=True).distinct()
        
        return Response({
            "total": total_staff.count(),
            "present": len(present_ids),
            "absent": total_staff.count() - len(present_ids)
        })

 # 1. Staff Management (GET all, POST new)
class StaffListCreateView(generics.ListCreateAPIView):
    queryset = UserProfile.objects.filter(role='staff')
    serializer_class = UserProfileSerializer

# 2. Individual Staff (GET, PUT, DELETE)
class StaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'id'

# 3. Leave Management
class LeaveView(APIView):
    def get(self, request, user_id=None):
        if user_id:
            leaves = Leave.objects.filter(user_id=user_id).order_by('-created_at')
        else:
            leaves = Leave.objects.all().order_by('-created_at')
        # You would typically use a LeaveSerializer here
        return Response([{"id": l.id, "status": l.status, "reason": l.reason} for l in leaves])

    def post(self, request):
        # Logic to create leave from request.data
        Leave.objects.create(**request.data)
        return Response({"success": True})

# 4. Reports API
class ReportsView(APIView):
    def get(self, request):
        staff_id = request.query_params.get('staffId', 'all')
        # Logic to filter Attendance based on staff_id and date ranges
        # Same as your FastAPI query logic but using Django filter()
        return Response({"message": "Report data here"})       