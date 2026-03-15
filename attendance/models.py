from django.db import models

class UserProfile(models.Model):
    ROLE_CHOICES = [('admin', 'Admin'), ('staff', 'Staff')]
    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive')]

    mobile = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(null=True, blank=True)
    designation = models.CharField(max_length=100, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    join_date = models.DateField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='staff')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    salary = models.FloatField(default=0)
    total_leaves = models.IntegerField(default=20)

    def __str__(self):
        return f"{self.name} ({self.mobile})"

class Attendance(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    type = models.CharField(max_length=10) # IN or OUT
    timestamp = models.DateTimeField(auto_now_add=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    photo = models.TextField(null=True, blank=True) # Base64

class Leave(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    type = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField(null=True, blank=True)
    attachment = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

class Holiday(models.Model):
    date = models.DateField(unique=True)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, default='public')

class Payslip(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    month = models.CharField(max_length=20)
    year = models.IntegerField()
    pdf_url = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)