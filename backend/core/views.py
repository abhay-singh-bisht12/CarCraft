from django.db.models import Q
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.auth import login as auth_login, logout as auth_logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from .models import UserProfile, Vehicle, CarBooking, DealershipEnquiry, UserFavourite
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    ProfileUpdateSerializer,
    VehicleSerializer,
    AdminVehicleSerializer,
    CarBookingSerializer,
    AdminBookingSerializer,
    DealershipEnquirySerializer,
    AdminEnquirySerializer,
    AdminCustomerSerializer,
    UserFavouriteSerializer,
)


class IsDealershipStaffOrAdmin(BasePermission):
    """
    Strict permission ensuring only authenticated staff or superuser accounts can access dealership admin APIs.
    Returns HTTP 403 Forbidden for regular customer accounts.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or request.user.is_superuser)
        )


def serialize_user_data(user):
    """
    Consistent serializer for authenticated user accounts.
    Includes isStaff and role so client UI can enforce navigation without guessing.
    """
    full_name = f"{user.first_name} {user.last_name}".strip()
    phone = user.profile.phone if hasattr(user, 'profile') else ''
    is_admin = bool(user.is_staff or user.is_superuser)
    return {
        'id': user.id,
        'email': user.email,
        'fullName': full_name or user.username,
        'phone': phone,
        'isStaff': user.is_staff,
        'isSuperuser': user.is_superuser,
        'role': 'admin' if is_admin else 'customer',
        'dateJoined': user.date_joined.isoformat(),
    }


def format_serializer_errors(errors):
    formatted = {}
    for key, value in errors.items():
        if isinstance(value, list) and len(value) > 0:
            formatted[key] = str(value[0])
        else:
            formatted[key] = str(value)
    return formatted


# ==========================================
# PUBLIC / AUTHENTICATION ENDPOINTS
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint returning JSON status confirming backend is operational.
    """
    return Response(
        {
            'status': 'healthy',
            'service': 'CarCraft Automotive Inventory & Dealership Suite API',
            'version': '1.0.0',
            'timestamp': timezone.now().isoformat(),
            'environment': 'development',
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Create a new customer account with secure password hashing.
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                'success': True,
                'message': 'Account created successfully! You can now sign in.',
                'token': token.key,
                'user': serialize_user_data(user),
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(format_serializer_errors(serializer.errors), status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authenticate an existing user via email and hashed password.
    Returns secure auth token and user details upon success.
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)

        if hasattr(request, 'session'):
            auth_login(request, user)

        return Response(
            {
                'success': True,
                'message': 'Signed in successfully. Welcome to CarCraft!',
                'token': token.key,
                'user': serialize_user_data(user),
            },
            status=status.HTTP_200_OK,
        )

    errors = serializer.errors
    formatted_errors = format_serializer_errors(errors)

    if 'detail' in formatted_errors:
        return Response(formatted_errors, status=status.HTTP_401_UNAUTHORIZED)

    return Response(formatted_errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Secure endpoint to verify the client's auth token on page reload.
    """
    return Response(
        {
            'success': True,
            'user': serialize_user_data(request.user),
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Invalidate the user's auth token and session in the database.
    """
    if hasattr(request.user, 'auth_token'):
        request.user.auth_token.delete()

    if hasattr(request, 'session'):
        auth_logout(request)

    return Response(
        {
            'success': True,
            'message': 'Logged out successfully.',
        },
        status=status.HTTP_200_OK,
    )


# ==========================================
# CUSTOMER PROFILE & WISHLIST ENDPOINTS
# ==========================================

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Customer profile retrieval and update.
    Strictly restricted to request.user.
    """
    user = request.user
    if request.method == 'GET':
        return Response({
            'success': True,
            'user': serialize_user_data(user),
        }, status=status.HTTP_200_OK)

    serializer = ProfileUpdateSerializer(instance=user, data=request.data, partial=True)
    if serializer.is_valid():
        updated_user = serializer.save()
        return Response({
            'success': True,
            'message': 'Profile updated successfully.',
            'user': serialize_user_data(updated_user),
        }, status=status.HTTP_200_OK)

    return Response(format_serializer_errors(serializer.errors), status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def favourite_toggle_list_view(request):
    """
    List saved favourites or toggle a favourite vehicle for the authenticated user.
    """
    if request.method == 'GET':
        favourites = UserFavourite.objects.filter(user=request.user)
        serializer = UserFavouriteSerializer(favourites, many=True)
        favourite_ids = list(favourites.values_list('car_id', flat=True))
        return Response({
            'success': True,
            'count': favourites.count(),
            'favourites': serializer.data,
            'favourite_ids': favourite_ids,
        }, status=status.HTTP_200_OK)

    car_id = request.data.get('car_id')
    car_name = request.data.get('car_name', '').strip()

    if car_id is None:
        return Response({'car_id': 'car_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        car_id = int(car_id)
    except (ValueError, TypeError):
        return Response({'car_id': 'car_id must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)

    vehicle = Vehicle.objects.filter(id=car_id).first()
    if vehicle and not car_name:
        car_name = vehicle.name

    existing = UserFavourite.objects.filter(user=request.user, car_id=car_id).first()
    if existing:
        existing.delete()
        return Response({
            'success': True,
            'action': 'removed',
            'is_favourite': False,
            'car_id': car_id,
            'message': f'Removed {car_name or "vehicle"} from your saved wishlist.',
        }, status=status.HTTP_200_OK)

    new_fav = UserFavourite.objects.create(
        user=request.user,
        vehicle=vehicle,
        car_id=car_id,
        car_name=car_name or f'Car #{car_id}',
    )
    return Response({
        'success': True,
        'action': 'added',
        'is_favourite': True,
        'car_id': car_id,
        'favourite': UserFavouriteSerializer(new_fav).data,
        'message': f'Added {car_name or "vehicle"} to your saved wishlist!',
    }, status=status.HTTP_201_CREATED)


# ==========================================
# CUSTOMER VEHICLE INVENTORY (DATABASE BACKED)
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def vehicle_list_view(request):
    """
    List published and active vehicles from the shared database.
    Supports filtering by search query, min_price, max_price, fuel_type, transmission, and sort.
    """
    queryset = Vehicle.objects.filter(is_published=True, is_deleted=False)

    # Search filter: matches name, brand, or model
    search = request.GET.get('search', '').strip()
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) | Q(brand__icontains=search) | Q(model__icontains=search)
        )

    # Min price
    min_price = request.GET.get('min_price')
    if min_price:
        try:
            queryset = queryset.filter(price__gte=float(min_price))
        except (ValueError, TypeError):
            pass

    # Max price
    max_price = request.GET.get('max_price')
    if max_price:
        try:
            queryset = queryset.filter(price__lte=float(max_price))
        except (ValueError, TypeError):
            pass

    # Fuel type
    fuel_type = request.GET.get('fuel_type')
    if fuel_type and fuel_type.lower() != 'all':
        queryset = queryset.filter(fuel_type__iexact=fuel_type)

    # Transmission
    transmission = request.GET.get('transmission')
    if transmission and transmission.lower() != 'all':
        queryset = queryset.filter(transmission__iexact=transmission)

    # Sort
    sort_by = request.GET.get('sort', 'featured')
    if sort_by == 'price_asc' or sort_by == 'price-asc':
        queryset = queryset.order_by('price')
    elif sort_by == 'price_desc' or sort_by == 'price-desc':
        queryset = queryset.order_by('-price')
    else:
        # Default sort: featured tags first, then id
        queryset = queryset.order_by('-created_at')

    serializer = VehicleSerializer(queryset, many=True)
    return Response({
        'success': True,
        'count': queryset.count(),
        'vehicles': serializer.data,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def vehicle_detail_view(request, pk):
    """
    Retrieve single vehicle details if published and not deleted.
    """
    vehicle = Vehicle.objects.filter(pk=pk, is_published=True, is_deleted=False).first()
    if not vehicle:
        return Response(
            {'detail': 'Vehicle not found or no longer available.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = VehicleSerializer(vehicle)
    return Response({
        'success': True,
        'vehicle': serializer.data,
    }, status=status.HTTP_200_OK)


# ==========================================
# CUSTOMER BOOKINGS & ENQUIRIES
# ==========================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def booking_list_create_view(request):
    """
    List and create bookings for the authenticated user.
    Customer bookings are created with status='Pending'.
    """
    if request.method == 'GET':
        bookings = CarBooking.objects.filter(user=request.user)
        serializer = CarBookingSerializer(bookings, many=True)
        return Response({
            'success': True,
            'count': bookings.count(),
            'bookings': serializer.data,
        }, status=status.HTTP_200_OK)

    serializer = CarBookingSerializer(data=request.data)
    if serializer.is_valid():
        # New customer bookings are strictly created with status='Pending'
        booking = serializer.save(user=request.user, status='Pending')
        return Response({
            'success': True,
            'message': 'Booking request submitted successfully! Your request is pending dealership review.',
            'booking': CarBookingSerializer(booking).data,
        }, status=status.HTTP_201_CREATED)

    return Response(format_serializer_errors(serializer.errors), status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def enquiry_list_create_view(request):
    """
    List and create dealership inquiries for the authenticated user.
    Internal admin notes are never exposed in customer serializers.
    """
    if request.method == 'GET':
        enquiries = DealershipEnquiry.objects.filter(user=request.user)
        serializer = DealershipEnquirySerializer(enquiries, many=True)
        return Response({
            'success': True,
            'count': enquiries.count(),
            'enquiries': serializer.data,
        }, status=status.HTTP_200_OK)

    serializer = DealershipEnquirySerializer(data=request.data)
    if serializer.is_valid():
        enquiry = serializer.save(user=request.user, status='Received')
        return Response({
            'success': True,
            'message': 'Enquiry submitted successfully! A dealership specialist will review and respond.',
            'enquiry': DealershipEnquirySerializer(enquiry).data,
        }, status=status.HTTP_201_CREATED)

    return Response(format_serializer_errors(serializer.errors), status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# ADMIN DASHBOARD & MANAGEMENT (STAFF/ADMIN ONLY)
# ==========================================

@api_view(['GET'])
@permission_classes([IsDealershipStaffOrAdmin])
def admin_overview_view(request):
    """
    Dealership owner overview metrics computed from the single shared database.
    """
    total_vehicles = Vehicle.objects.filter(is_deleted=False).count()
    available_vehicles = Vehicle.objects.filter(is_deleted=False, is_available=True, is_published=True).count()
    unpublished_vehicles = Vehicle.objects.filter(is_deleted=False, is_published=False).count()

    total_bookings = CarBooking.objects.count()
    pending_bookings = CarBooking.objects.filter(status='Pending').count()
    confirmed_bookings = CarBooking.objects.filter(status='Confirmed').count()
    completed_bookings = CarBooking.objects.filter(status='Completed').count()
    cancelled_bookings = CarBooking.objects.filter(status='Cancelled').count()

    total_enquiries = DealershipEnquiry.objects.count()
    open_enquiries = DealershipEnquiry.objects.filter(status__in=['Received', 'In Review']).count()
    responded_enquiries = DealershipEnquiry.objects.filter(status='Responded').count()

    total_customers = User.objects.filter(is_staff=False, is_superuser=False).count()

    recent_bookings = CarBooking.objects.all().order_by('-created_at')[:5]
    recent_enquiries = DealershipEnquiry.objects.all().order_by('-created_at')[:5]

    return Response({
        'success': True,
        'metrics': {
            'totalVehicles': total_vehicles,
            'availableVehicles': available_vehicles,
            'unpublishedVehicles': unpublished_vehicles,
            'totalBookings': total_bookings,
            'pendingBookings': pending_bookings,
            'confirmedBookings': confirmed_bookings,
            'completedBookings': completed_bookings,
            'cancelledBookings': cancelled_bookings,
            'totalEnquiries': total_enquiries,
            'openEnquiries': open_enquiries,
            'respondedEnquiries': responded_enquiries,
            'totalCustomers': total_customers,
        },
        'recentBookings': AdminBookingSerializer(recent_bookings, many=True).data,
        'recentEnquiries': AdminEnquirySerializer(recent_enquiries, many=True).data,
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsDealershipStaffOrAdmin])
def admin_vehicle_list_create_view(request):
    """
    Admin Vehicle Management: List all vehicles or create a new vehicle.
    """
    if request.method == 'GET':
        vehicles = Vehicle.objects.filter(is_deleted=False).order_by('-created_at')
        return Response({
            'success': True,
            'count': vehicles.count(),
            'vehicles': AdminVehicleSerializer(vehicles, many=True).data,
        }, status=status.HTTP_200_OK)

    serializer = AdminVehicleSerializer(data=request.data)
    if serializer.is_valid():
        vehicle = serializer.save()
        return Response({
            'success': True,
            'message': f'Vehicle "{vehicle.name}" created successfully.',
            'vehicle': AdminVehicleSerializer(vehicle).data,
        }, status=status.HTTP_201_CREATED)

    return Response(format_serializer_errors(serializer.errors), status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsDealershipStaffOrAdmin])
def admin_vehicle_detail_view(request, pk):
    """
    Admin Vehicle Detail: View, update, or soft-delete a vehicle.
    """
    vehicle = Vehicle.objects.filter(pk=pk, is_deleted=False).first()
    if not vehicle:
        return Response({'detail': 'Vehicle not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({
            'success': True,
            'vehicle': AdminVehicleSerializer(vehicle).data,
        }, status=status.HTTP_200_OK)

    if request.method in ['PUT', 'PATCH']:
        serializer = AdminVehicleSerializer(vehicle, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'success': True,
                'message': f'Vehicle "{updated.name}" updated successfully.',
                'vehicle': AdminVehicleSerializer(updated).data,
            }, status=status.HTTP_200_OK)
        return Response(format_serializer_errors(serializer.errors), status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        # Soft delete to preserve historical customer bookings and inquiries
        vehicle.is_deleted = True
        vehicle.is_published = False
        vehicle.is_available = False
        vehicle.save()
        return Response({
            'success': True,
            'message': f'Vehicle "{vehicle.name}" archived successfully.',
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsDealershipStaffOrAdmin])
def admin_vehicle_toggle_publish_view(request, pk):
    """
    Toggle vehicle visibility in the customer showroom.
    """
    vehicle = Vehicle.objects.filter(pk=pk, is_deleted=False).first()
    if not vehicle:
        return Response({'detail': 'Vehicle not found.'}, status=status.HTTP_404_NOT_FOUND)

    vehicle.is_published = not vehicle.is_published
    vehicle.save()

    status_str = 'published to showroom' if vehicle.is_published else 'hidden from showroom'
    return Response({
        'success': True,
        'is_published': vehicle.is_published,
        'message': f'Vehicle "{vehicle.name}" is now {status_str}.',
        'vehicle': AdminVehicleSerializer(vehicle).data,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsDealershipStaffOrAdmin])
def admin_vehicle_toggle_availability_view(request, pk):
    """
    Toggle vehicle availability for client bookings (Available vs Reserved/Sold).
    """
    vehicle = Vehicle.objects.filter(pk=pk, is_deleted=False).first()
    if not vehicle:
        return Response({'detail': 'Vehicle not found.'}, status=status.HTTP_404_NOT_FOUND)

    vehicle.is_available = not vehicle.is_available
    vehicle.save()

    avail_str = 'marked available for booking' if vehicle.is_available else 'marked reserved / unavailable'
    return Response({
        'success': True,
        'is_available': vehicle.is_available,
        'message': f'Vehicle "{vehicle.name}" is now {avail_str}.',
        'vehicle': AdminVehicleSerializer(vehicle).data,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsDealershipStaffOrAdmin])
def admin_booking_list_view(request):
    """
    List all customer bookings with filter by status.
    """
    queryset = CarBooking.objects.all().order_by('-created_at')

    status_filter = request.GET.get('status')
    if status_filter and status_filter.lower() != 'all':
        queryset = queryset.filter(status__iexact=status_filter)

    return Response({
        'success': True,
        'count': queryset.count(),
        'bookings': AdminBookingSerializer(queryset, many=True).data,
    }, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsDealershipStaffOrAdmin])
def admin_booking_update_view(request, pk):
    """
    Approve, reject, or complete a customer booking.
    Only authorized admins may transition status.
    """
    booking = CarBooking.objects.filter(pk=pk).first()
    if not booking:
        return Response({'detail': 'Booking request not found.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    admin_notes = request.data.get('admin_notes')

    valid_statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled']
    if new_status:
        if new_status not in valid_statuses:
            return Response(
                {'status': f'Invalid status. Allowed values: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = new_status

    if admin_notes is not None:
        booking.admin_notes = admin_notes.strip()

    booking.save()

    action_word = 'approved' if booking.status == 'Confirmed' else 'rejected' if booking.status == 'Cancelled' else 'updated'
    return Response({
        'success': True,
        'message': f'Booking #{booking.id} for {booking.car_name} has been {action_word}.',
        'booking': AdminBookingSerializer(booking).data,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsDealershipStaffOrAdmin])
def admin_enquiry_list_view(request):
    """
    List all customer enquiries with filter by status.
    """
    queryset = DealershipEnquiry.objects.all().order_by('-created_at')

    status_filter = request.GET.get('status')
    if status_filter and status_filter.lower() != 'all':
        queryset = queryset.filter(status__iexact=status_filter)

    return Response({
        'success': True,
        'count': queryset.count(),
        'enquiries': AdminEnquirySerializer(queryset, many=True).data,
    }, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsDealershipStaffOrAdmin])
def admin_enquiry_update_view(request, pk):
    """
    Update handling status, customer-visible response, or internal notes on an enquiry.
    """
    enquiry = DealershipEnquiry.objects.filter(pk=pk).first()
    if not enquiry:
        return Response({'detail': 'Enquiry not found.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    response_message = request.data.get('response_message')
    admin_notes = request.data.get('admin_notes')

    valid_statuses = ['Received', 'In Review', 'Responded']
    if new_status:
        if new_status not in valid_statuses:
            return Response(
                {'status': f'Invalid status. Allowed values: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        enquiry.status = new_status

    if response_message is not None:
        enquiry.response_message = response_message.strip()
        # Automatically mark Responded if response message is provided and status was Received
        if response_message.strip() and enquiry.status == 'Received':
            enquiry.status = 'Responded'

    if admin_notes is not None:
        enquiry.admin_notes = admin_notes.strip()

    enquiry.save()

    return Response({
        'success': True,
        'message': f'Enquiry #{enquiry.id} updated successfully.',
        'enquiry': AdminEnquirySerializer(enquiry).data,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsDealershipStaffOrAdmin])
def admin_customer_list_view(request):
    """
    List real registered customer accounts with their booking and enquiry tallies.
    """
    customers = User.objects.all().order_by('-date_joined')
    serializer = AdminCustomerSerializer(customers, many=True)
    return Response({
        'success': True,
        'count': customers.count(),
        'customers': serializer.data,
    }, status=status.HTTP_200_OK)
