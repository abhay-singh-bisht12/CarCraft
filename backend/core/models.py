from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=25, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} Profile"


class Vehicle(models.Model):
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100, blank=True, default='')
    year = models.IntegerField(default=2024)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    image = models.TextField(blank=True, default='')
    tag = models.CharField(max_length=50, blank=True, default='Featured')
    mileage = models.CharField(max_length=50, blank=True, default='0 mi')
    fuel_type = models.CharField(max_length=50, default='Gasoline')
    engine = models.CharField(max_length=150, blank=True, default='')
    transmission = models.CharField(max_length=50, default='Automatic')
    drivetrain = models.CharField(max_length=50, default='AWD')
    horsepower = models.CharField(max_length=50, blank=True, default='300 HP')
    description = models.TextField(blank=True, default='')
    is_published = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.year} {self.brand} {self.name} (${self.price})"


class CarBooking(models.Model):
    BOOKING_TYPE_CHOICES = (
        ('test_drive', 'Test Drive'),
        ('purchase_inquiry', 'Purchase Request'),
    )
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    car_id = models.IntegerField()
    car_name = models.CharField(max_length=200)
    booking_type = models.CharField(max_length=40, choices=BOOKING_TYPE_CHOICES, default='test_drive')
    preferred_date = models.DateField()
    preferred_time = models.CharField(max_length=50, blank=True, default='Morning (10:00 AM - 1:00 PM)')
    contact_phone = models.CharField(max_length=25, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    admin_notes = models.TextField(blank=True, default='')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.car_name} ({self.booking_type}) - {self.status}"


class DealershipEnquiry(models.Model):
    STATUS_CHOICES = (
        ('Received', 'Received'),
        ('In Review', 'In Review'),
        ('Responded', 'Responded'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enquiries')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='enquiries')
    car_id = models.IntegerField(null=True, blank=True)
    car_name = models.CharField(max_length=200, blank=True, default='')
    subject = models.CharField(max_length=200)
    message = models.TextField()
    admin_notes = models.TextField(blank=True, default='')
    response_message = models.TextField(blank=True, default='')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Received')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Enquiry by {self.user.email}: {self.subject} ({self.status})"


class UserFavourite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favourites')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, null=True, blank=True, related_name='favourites')
    car_id = models.IntegerField()
    car_name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'car_id')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} -> {self.car_name}"
