from django.urls import path
from .views import (
    health_check,
    register_view,
    login_view,
    current_user_view,
    logout_view,
    profile_view,
    vehicle_list_view,
    vehicle_detail_view,
    booking_list_create_view,
    enquiry_list_create_view,
    favourite_toggle_list_view,
    admin_overview_view,
    admin_vehicle_list_create_view,
    admin_vehicle_detail_view,
    admin_vehicle_toggle_publish_view,
    admin_vehicle_toggle_availability_view,
    admin_booking_list_view,
    admin_booking_update_view,
    admin_enquiry_list_view,
    admin_enquiry_update_view,
    admin_customer_list_view,
)

urlpatterns = [
    # System & Auth Endpoints
    path('health/', health_check, name='health_check'),
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('me/', current_user_view, name='current_user'),
    path('logout/', logout_view, name='logout'),

    # Profile & Customer Action Endpoints
    path('profile/', profile_view, name='profile'),
    path('vehicles/', vehicle_list_view, name='vehicle_list'),
    path('vehicles/<int:pk>/', vehicle_detail_view, name='vehicle_detail'),
    path('bookings/', booking_list_create_view, name='bookings'),
    path('enquiries/', enquiry_list_create_view, name='enquiries'),
    path('favourites/', favourite_toggle_list_view, name='favourites'),

    # Admin Dealership Portal Endpoints (Staff/Superuser Only)
    path('admin/overview/', admin_overview_view, name='admin_overview'),
    path('admin/vehicles/', admin_vehicle_list_create_view, name='admin_vehicle_list'),
    path('admin/vehicles/<int:pk>/', admin_vehicle_detail_view, name='admin_vehicle_detail'),
    path('admin/vehicles/<int:pk>/toggle-publish/', admin_vehicle_toggle_publish_view, name='admin_vehicle_toggle_publish'),
    path('admin/vehicles/<int:pk>/toggle-availability/', admin_vehicle_toggle_availability_view, name='admin_vehicle_toggle_availability'),
    path('admin/bookings/', admin_booking_list_view, name='admin_booking_list'),
    path('admin/bookings/<int:pk>/', admin_booking_update_view, name='admin_booking_update'),
    path('admin/enquiries/', admin_enquiry_list_view, name='admin_enquiry_list'),
    path('admin/enquiries/<int:pk>/', admin_enquiry_update_view, name='admin_enquiry_update'),
    path('admin/customers/', admin_customer_list_view, name='admin_customer_list'),

    # Optional /auth/ convenience aliases
    path('auth/register/', register_view, name='auth_register'),
    path('auth/login/', login_view, name='auth_login'),
    path('auth/me/', current_user_view, name='auth_me'),
    path('auth/logout/', logout_view, name='auth_logout'),
]
