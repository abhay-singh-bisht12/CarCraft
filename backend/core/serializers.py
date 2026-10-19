import re
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class RegisterSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=150, min_length=2, required=True, error_messages={
        'required': 'Full name is required.',
        'blank': 'Full name cannot be blank.',
        'min_length': 'Full name must be at least 2 characters.',
    })
    email = serializers.EmailField(required=True, error_messages={
        'required': 'Email address is required.',
        'blank': 'Email address cannot be blank.',
        'invalid': 'Please enter a valid email address.',
    })
    phone = serializers.CharField(max_length=25, required=False, allow_blank=True, default='')
    password = serializers.CharField(write_only=True, required=True, min_length=8, error_messages={
        'required': 'Password is required.',
        'blank': 'Password cannot be blank.',
        'min_length': 'Password must be at least 8 characters long.',
    })
    confirmPassword = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def validate_email(self, value):
        normalized_email = value.strip().lower()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError('An account with this email address already exists.')
        return normalized_email

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirmPassword')

        if confirm_password is not None and password != confirm_password:
            raise serializers.ValidationError({'confirmPassword': 'Passwords do not match.'})

        # Flexible phone format check if provided
        phone = attrs.get('phone', '').strip()
        if phone:
            phone_pattern = r'^[+]?[0-9\s().-]{7,25}$'
            if not re.match(phone_pattern, phone):
                raise serializers.ValidationError({'phone': 'Please enter a valid phone number format.'})

        return attrs

    def create(self, validated_data):
        full_name = validated_data['fullName'].strip()
        email = validated_data['email']
        password = validated_data['password']
        phone = validated_data.get('phone', '').strip()

        # Split full name into first and last name for Django User model
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        # Use normalized email as unique username
        username = email

        # create_user automatically applies Django's secure PBKDF2 password hashing
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        UserProfile.objects.create(user=user, phone=phone)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, error_messages={
        'required': 'Email address is required.',
        'blank': 'Email address cannot be blank.',
    })
    password = serializers.CharField(write_only=True, required=True, error_messages={
        'required': 'Password is required.',
        'blank': 'Password cannot be blank.',
    })
    rememberMe = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password', '')

        # Lookup user by email or username
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            user = User.objects.filter(username__iexact=email).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError({
                'detail': 'Invalid email or password. Please verify your credentials and try again.'
            })

        if not user.is_active:
            raise serializers.ValidationError({
                'detail': 'This account is inactive. Please contact dealership administration.'
            })

        attrs['user'] = user
        return attrs


class ProfileUpdateSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=150, min_length=2, required=True, error_messages={
        'required': 'Full name is required.',
        'blank': 'Full name cannot be blank.',
        'min_length': 'Full name must be at least 2 characters.',
    })
    phone = serializers.CharField(max_length=25, required=False, allow_blank=True, default='')
    email = serializers.EmailField(read_only=True)

    def validate_phone(self, value):
        phone = (value or '').strip()
        if phone:
            phone_pattern = r'^[+]?[0-9\s().-]{7,25}$'
            if not re.match(phone_pattern, phone):
                raise serializers.ValidationError('Please enter a valid phone number format.')
        return phone

    def update(self, instance, validated_data):
        full_name = validated_data.get('fullName', '').strip()
        if full_name:
            name_parts = full_name.split(' ', 1)
            instance.first_name = name_parts[0]
            instance.last_name = name_parts[1] if len(name_parts) > 1 else ''
            instance.save()

        profile, _ = UserProfile.objects.get_or_create(user=instance)
        if 'phone' in validated_data:
            profile.phone = validated_data.get('phone', '').strip()
            profile.save()

        return instance


from .models import UserProfile, Vehicle, CarBooking, DealershipEnquiry, UserFavourite


class VehicleSerializer(serializers.ModelSerializer):
    fuelType = serializers.CharField(source='fuel_type', read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id',
            'name',
            'brand',
            'model',
            'year',
            'price',
            'image',
            'tag',
            'mileage',
            'fuel_type',
            'fuelType',
            'engine',
            'transmission',
            'drivetrain',
            'horsepower',
            'description',
            'is_available',
            'created_at',
        ]


class AdminVehicleSerializer(serializers.ModelSerializer):
    fuelType = serializers.CharField(source='fuel_type', required=False)

    class Meta:
        model = Vehicle
        fields = [
            'id',
            'name',
            'brand',
            'model',
            'year',
            'price',
            'image',
            'tag',
            'mileage',
            'fuel_type',
            'fuelType',
            'engine',
            'transmission',
            'drivetrain',
            'horsepower',
            'description',
            'is_published',
            'is_available',
            'is_deleted',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        # Allow frontend to pass fuelType or fuel_type
        if 'fuel_type' not in attrs and 'fuelType' in self.initial_data:
            attrs['fuel_type'] = self.initial_data['fuelType']
        return attrs


class CarBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarBooking
        fields = [
            'id',
            'car_id',
            'car_name',
            'booking_type',
            'preferred_date',
            'preferred_time',
            'contact_phone',
            'notes',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'created_at']

    def validate(self, attrs):
        car_id = attrs.get('car_id')
        if not car_id or car_id <= 0:
            raise serializers.ValidationError({'car_id': 'Invalid vehicle identifier.'})

        # Check vehicle availability in shared database
        vehicle = Vehicle.objects.filter(id=car_id).first()
        if vehicle:
            if vehicle.is_deleted or not vehicle.is_published:
                raise serializers.ValidationError({
                    'detail': f'"{vehicle.name}" is no longer listed in the showroom and cannot be booked.'
                })
            if not vehicle.is_available:
                raise serializers.ValidationError({
                    'detail': f'"{vehicle.name}" is currently marked unavailable or reserved for another client.'
                })
            attrs['vehicle'] = vehicle
            attrs['car_name'] = vehicle.name

        return attrs


class AdminBookingSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()

    class Meta:
        model = CarBooking
        fields = [
            'id',
            'car_id',
            'car_name',
            'booking_type',
            'preferred_date',
            'preferred_time',
            'contact_phone',
            'notes',
            'admin_notes',
            'status',
            'created_at',
            'customer',
        ]
        read_only_fields = ['id', 'created_at', 'customer']

    def get_customer(self, obj):
        user = obj.user
        full_name = f"{user.first_name} {user.last_name}".strip() or user.username
        phone = user.profile.phone if hasattr(user, 'profile') else ''
        return {
            'id': user.id,
            'email': user.email,
            'fullName': full_name,
            'phone': phone or obj.contact_phone,
        }


class DealershipEnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = DealershipEnquiry
        fields = [
            'id',
            'car_id',
            'car_name',
            'subject',
            'message',
            'status',
            'response_message',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'response_message', 'created_at']

    def validate_subject(self, value):
        if not value.strip():
            raise serializers.ValidationError('Subject cannot be empty.')
        return value.strip()

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError('Message cannot be empty.')
        return value.strip()


class AdminEnquirySerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()

    class Meta:
        model = DealershipEnquiry
        fields = [
            'id',
            'car_id',
            'car_name',
            'subject',
            'message',
            'status',
            'response_message',
            'admin_notes',
            'created_at',
            'customer',
        ]
        read_only_fields = ['id', 'created_at', 'customer']

    def get_customer(self, obj):
        user = obj.user
        full_name = f"{user.first_name} {user.last_name}".strip() or user.username
        phone = user.profile.phone if hasattr(user, 'profile') else ''
        return {
            'id': user.id,
            'email': user.email,
            'fullName': full_name,
            'phone': phone,
        }


class AdminCustomerSerializer(serializers.ModelSerializer):
    fullName = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    dateJoined = serializers.DateTimeField(source='date_joined', read_only=True)
    isActive = serializers.BooleanField(source='is_active', read_only=True)
    isStaff = serializers.BooleanField(source='is_staff', read_only=True)
    totalBookings = serializers.SerializerMethodField()
    totalEnquiries = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'fullName',
            'phone',
            'dateJoined',
            'isActive',
            'isStaff',
            'totalBookings',
            'totalEnquiries',
        ]

    def get_fullName(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name or obj.username

    def get_phone(self, obj):
        return obj.profile.phone if hasattr(obj, 'profile') else ''

    def get_totalBookings(self, obj):
        return obj.bookings.count()

    def get_totalEnquiries(self, obj):
        return obj.enquiries.count()


class UserFavouriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFavourite
        fields = ['id', 'car_id', 'car_name', 'created_at']
        read_only_fields = ['id', 'created_at']
