from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from .models import UserProfile, Vehicle, CarBooking, DealershipEnquiry, UserFavourite


class CarCraftAuthAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.health_url = reverse('health_check')
        self.me_url = reverse('current_user')
        self.logout_url = reverse('logout')
        self.profile_url = reverse('profile')
        self.vehicles_url = reverse('vehicle_list')
        self.bookings_url = reverse('bookings')
        self.enquiries_url = reverse('enquiries')
        self.favourites_url = reverse('favourites')

        # Admin URLs
        self.admin_overview_url = reverse('admin_overview')
        self.admin_vehicles_url = reverse('admin_vehicle_list')
        self.admin_bookings_url = reverse('admin_booking_list')
        self.admin_enquiries_url = reverse('admin_enquiry_list')
        self.admin_customers_url = reverse('admin_customer_list')

    def test_health_check_endpoint(self):
        """Verify /api/health/ returns HTTP 200 with healthy status JSON."""
        response = self.client.get(self.health_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('status'), 'healthy')
        self.assertIn('service', response.data)
        self.assertIn('timestamp', response.data)
        self.assertEqual(response.data.get('version'), '1.0.0')

    def test_cors_header_presence(self):
        """Verify CORS allows request from React frontend on port 5173."""
        response = self.client.get(self.health_url, HTTP_ORIGIN='http://localhost:5173')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.headers.get('Access-Control-Allow-Origin'), 'http://localhost:5173')

    def test_successful_registration(self):
        """Verify registration creates real user with hashed password in database."""
        payload = {
            'fullName': 'Alexander Vance',
            'email': 'alexander@carcraft.com',
            'phone': '+1 (555) 432-1098',
            'password': 'SecureDealershipPass2026!',
            'confirmPassword': 'SecureDealershipPass2026!',
        }
        response = self.client.post(self.register_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data.get('success'))
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], 'alexander@carcraft.com')
        self.assertEqual(response.data['user']['fullName'], 'Alexander Vance')
        self.assertEqual(response.data['user']['phone'], '+1 (555) 432-1098')

        # Verify in database
        user = User.objects.filter(email='alexander@carcraft.com').first()
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, 'Alexander')
        self.assertEqual(user.last_name, 'Vance')
        # Crucial check: password must NOT be plain text
        self.assertNotEqual(user.password, 'SecureDealershipPass2026!')
        self.assertTrue(user.check_password('SecureDealershipPass2026!'))
        self.assertEqual(user.profile.phone, '+1 (555) 432-1098')

    def test_duplicate_email_registration(self):
        """Verify registration rejects already registered emails."""
        User.objects.create_user(
            username='existing@carcraft.com',
            email='existing@carcraft.com',
            password='InitialPassword123!',
            first_name='Existing',
            last_name='User',
        )

        payload = {
            'fullName': 'Duplicate User',
            'email': 'existing@carcraft.com',
            'password': 'NewPassword123!',
            'confirmPassword': 'NewPassword123!',
        }
        response = self.client.post(self.register_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        self.assertIn('already exists', str(response.data['email']))

    def test_registration_validation_short_password(self):
        """Verify registration rejects passwords shorter than 8 characters."""
        payload = {
            'fullName': 'Short Pass',
            'email': 'short@carcraft.com',
            'password': '123',
            'confirmPassword': '123',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_registration_password_mismatch(self):
        """Verify registration rejects non-matching passwords."""
        payload = {
            'fullName': 'Mismatch User',
            'email': 'mismatch@carcraft.com',
            'password': 'FirstPassword123!',
            'confirmPassword': 'DifferentPassword123!',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirmPassword', response.data)

    def test_successful_login(self):
        """Verify login authenticates registered user and returns token and user info."""
        user = User.objects.create_user(
            username='client@carcraft.com',
            email='client@carcraft.com',
            password='ClientPassword2026!',
            first_name='Marcus',
            last_name='Sterling',
        )

        payload = {
            'email': 'client@carcraft.com',
            'password': 'ClientPassword2026!',
        }
        response = self.client.post(self.login_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('success'))
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], 'client@carcraft.com')
        self.assertEqual(response.data['user']['fullName'], 'Marcus Sterling')

    def test_invalid_login_wrong_password(self):
        """Verify login rejects incorrect passwords with HTTP 401."""
        User.objects.create_user(
            username='client@carcraft.com',
            email='client@carcraft.com',
            password='CorrectPassword123!',
        )

        payload = {
            'email': 'client@carcraft.com',
            'password': 'WrongPassword999!',
        }
        response = self.client.post(self.login_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)
        self.assertIn('Invalid email or password', str(response.data['detail']))

    def test_invalid_login_nonexistent_email(self):
        """Verify login rejects non-existent email addresses with HTTP 401."""
        payload = {
            'email': 'nonexistent@carcraft.com',
            'password': 'AnyPassword123!',
        }
        response = self.client.post(self.login_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)
        self.assertIn('Invalid email or password', str(response.data['detail']))

    def test_current_user_and_logout_flow(self):
        """Verify token verification via /api/me/ and session invalidation via /api/logout/."""
        user = User.objects.create_user(
            username='verified@carcraft.com',
            email='verified@carcraft.com',
            password='SecurePassword2026!',
            first_name='Helena',
            last_name='Shaw',
        )
        token = Token.objects.create(user=user)

        # 1. Unauthenticated request to /api/me/ must be rejected with 401
        res_unauth = self.client.get(self.me_url)
        self.assertEqual(res_unauth.status_code, status.HTTP_401_UNAUTHORIZED)

        # 2. Authenticated request with valid token header must succeed
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        res_me = self.client.get(self.me_url)
        self.assertEqual(res_me.status_code, status.HTTP_200_OK)
        self.assertEqual(res_me.data['user']['email'], 'verified@carcraft.com')
        self.assertEqual(res_me.data['user']['fullName'], 'Helena Shaw')

        # 3. Call /api/logout/ to invalidate the token in the backend
        res_logout = self.client.post(self.logout_url)
        self.assertEqual(res_logout.status_code, status.HTTP_200_OK)
        self.assertTrue(res_logout.data.get('success'))

        # Token must be deleted from database
        self.assertFalse(Token.objects.filter(key=token.key).exists())

        # 4. Subsequent requests with that old token must fail with 401
        res_after = self.client.get(self.me_url)
        self.assertEqual(res_after.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_protected_endpoints(self):
        """Verify unauthenticated requests to protected endpoints return HTTP 401."""
        endpoints = [
            (self.profile_url, 'GET'),
            (self.profile_url, 'PUT'),
            (self.bookings_url, 'GET'),
            (self.bookings_url, 'POST'),
            (self.enquiries_url, 'GET'),
            (self.enquiries_url, 'POST'),
            (self.favourites_url, 'GET'),
            (self.favourites_url, 'POST'),
        ]
        for url, method in endpoints:
            if method == 'GET':
                response = self.client.get(url)
            else:
                response = self.client.post(url, {}, format='json')
            self.assertEqual(
                response.status_code,
                status.HTTP_401_UNAUTHORIZED,
                f"Endpoint {url} with {method} should require authentication"
            )

    def test_profile_retrieval_and_update(self):
        """Verify profile retrieval and update for authenticated user."""
        user = User.objects.create_user(
            username='julian@carcraft.com',
            email='julian@carcraft.com',
            password='InitialPassword123!',
            first_name='Julian',
            last_name='Ross',
        )
        UserProfile.objects.create(user=user, phone='+1 555-111-2222')
        token = Token.objects.create(user=user)

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        # 1. GET profile
        get_res = self.client.get(self.profile_url)
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.data['user']['fullName'], 'Julian Ross')
        self.assertEqual(get_res.data['user']['phone'], '+1 555-111-2222')
        self.assertEqual(get_res.data['user']['email'], 'julian@carcraft.com')

        # 2. PUT / update profile
        update_payload = {
            'fullName': 'Julian S. Ross Jr.',
            'phone': '+1 555-999-8888',
        }
        put_res = self.client.put(self.profile_url, update_payload, format='json')
        self.assertEqual(put_res.status_code, status.HTTP_200_OK)
        self.assertTrue(put_res.data.get('success'))
        self.assertEqual(put_res.data['user']['fullName'], 'Julian S. Ross Jr.')
        self.assertEqual(put_res.data['user']['phone'], '+1 555-999-8888')

        # Verify database persisted
        user.refresh_from_db()
        self.assertEqual(user.first_name, 'Julian')
        self.assertEqual(user.last_name, 'S. Ross Jr.')
        self.assertEqual(user.profile.phone, '+1 555-999-8888')

    def test_profile_email_immutability(self):
        """Verify user email cannot be changed through profile update endpoint."""
        user = User.objects.create_user(
            username='original@carcraft.com',
            email='original@carcraft.com',
            password='InitialPassword123!',
            first_name='Original',
            last_name='Owner',
        )
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        # Attempt to change email
        payload = {
            'fullName': 'Original Owner',
            'email': 'hacked@carcraft.com',
        }
        res = self.client.put(self.profile_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertEqual(user.email, 'original@carcraft.com')
        self.assertEqual(res.data['user']['email'], 'original@carcraft.com')

    def test_profile_security_user_isolation(self):
        """Verify user cannot update another user's profile by injecting user id."""
        user_a = User.objects.create_user(
            username='user_a@carcraft.com',
            email='user_a@carcraft.com',
            password='PasswordA123!',
            first_name='User',
            last_name='A',
        )
        user_b = User.objects.create_user(
            username='user_b@carcraft.com',
            email='user_b@carcraft.com',
            password='PasswordB123!',
            first_name='User',
            last_name='B',
        )
        token_a = Token.objects.create(user=user_a)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token_a.key}')

        # User A tries to tamper with User B by passing user_b.id
        tamper_payload = {
            'user_id': user_b.id,
            'id': user_b.id,
            'fullName': 'Attacked Name',
        }
        res = self.client.put(self.profile_url, tamper_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # User B must be completely unaffected
        user_b.refresh_from_db()
        self.assertEqual(user_b.first_name, 'User')
        self.assertEqual(user_b.last_name, 'B')

        # Only User A changed
        user_a.refresh_from_db()
        self.assertEqual(user_a.first_name, 'Attacked')
        self.assertEqual(user_a.last_name, 'Name')

    def test_car_booking_flow_and_isolation(self):
        """Verify booking creation, listing, and isolation between clients."""
        user_a = User.objects.create_user(
            username='driver1@carcraft.com',
            email='driver1@carcraft.com',
            password='Password123!',
        )
        user_b = User.objects.create_user(
            username='driver2@carcraft.com',
            email='driver2@carcraft.com',
            password='Password123!',
        )
        token_a = Token.objects.create(user=user_a)
        token_b = Token.objects.create(user=user_b)

        # User A creates a test drive booking
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token_a.key}')
        booking_data = {
            'car_id': 1,
            'car_name': 'Porsche 911 Carrera GTS',
            'booking_type': 'test_drive',
            'preferred_date': '2026-11-05',
            'preferred_time': 'Morning (10:00 AM - 1:00 PM)',
            'contact_phone': '+1 555-432-1098',
            'notes': 'Interested in track pack package.',
        }
        res_create = self.client.post(self.bookings_url, booking_data, format='json')
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res_create.data.get('success'))
        self.assertEqual(res_create.data['booking']['car_name'], 'Porsche 911 Carrera GTS')

        # User A views their bookings
        res_list_a = self.client.get(self.bookings_url)
        self.assertEqual(res_list_a.status_code, status.HTTP_200_OK)
        self.assertEqual(res_list_a.data['count'], 1)

        # User B views their bookings - must be empty!
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token_b.key}')
        res_list_b = self.client.get(self.bookings_url)
        self.assertEqual(res_list_b.status_code, status.HTTP_200_OK)
        self.assertEqual(res_list_b.data['count'], 0)

    def test_dealership_enquiry_flow(self):
        """Verify dealership enquiry creation and listing."""
        user = User.objects.create_user(
            username='inquirer@carcraft.com',
            email='inquirer@carcraft.com',
            password='Password123!',
        )
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        enquiry_data = {
            'car_id': 2,
            'car_name': 'BMW M4 Competition Coupé',
            'subject': 'Financing & Trade-in Options',
            'message': 'Do you offer zero-down lease rates on the M4 Competition?',
        }
        res = self.client.post(self.enquiries_url, enquiry_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data.get('success'))
        self.assertEqual(res.data['enquiry']['subject'], 'Financing & Trade-in Options')

        # List enquiries
        res_list = self.client.get(self.enquiries_url)
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertEqual(res_list.data['count'], 1)

    def test_favourite_toggle_flow(self):
        """Verify saving and toggling favourite vehicles."""
        user = User.objects.create_user(
            username='fan@carcraft.com',
            email='fan@carcraft.com',
            password='Password123!',
        )
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        # 1. Add favourite
        res_add = self.client.post(
            self.favourites_url,
            {'car_id': 1, 'car_name': 'Porsche 911 Carrera GTS'},
            format='json'
        )
        self.assertEqual(res_add.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res_add.data.get('is_favourite'))
        self.assertEqual(res_add.data.get('action'), 'added')

        # 2. Check list
        res_list = self.client.get(self.favourites_url)
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertEqual(res_list.data['count'], 1)
        self.assertIn(1, res_list.data['favourite_ids'])

        # 3. Toggle again to remove
        res_remove = self.client.post(
            self.favourites_url,
            {'car_id': 1, 'car_name': 'Porsche 911 Carrera GTS'},
            format='json'
        )
        self.assertEqual(res_remove.status_code, status.HTTP_200_OK)
        self.assertFalse(res_remove.data.get('is_favourite'))
        self.assertEqual(res_remove.data.get('action'), 'removed')

        # 4. Check list is now empty
        res_list2 = self.client.get(self.favourites_url)
        self.assertEqual(res_list2.data['count'], 0)

    def test_admin_permissions_enforcement(self):
        """Verify only authenticated staff/admin can access admin endpoints."""
        customer = User.objects.create_user(
            username='regular@customer.com',
            email='regular@customer.com',
            password='CustomerPass123!',
            is_staff=False,
            is_superuser=False,
        )
        staff = User.objects.create_user(
            username='admin@dealership.com',
            email='admin@dealership.com',
            password='AdminPass123!',
            is_staff=True,
            is_superuser=False,
        )
        token_customer = Token.objects.create(user=customer)
        token_staff = Token.objects.create(user=staff)

        admin_urls = [
            self.admin_overview_url,
            self.admin_vehicles_url,
            self.admin_bookings_url,
            self.admin_enquiries_url,
            self.admin_customers_url,
        ]

        # 1. Unauthenticated requests must return 401
        self.client.credentials()
        for u in admin_urls:
            res = self.client.get(u)
            self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # 2. Regular customer must be rejected with 403 Forbidden
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token_customer.key}')
        for u in admin_urls:
            res = self.client.get(u)
            self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Staff user must be permitted with 200 OK
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token_staff.key}')
        for u in admin_urls:
            res = self.client.get(u)
            self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_public_vehicle_inventory_filtering_and_visibility(self):
        """Verify public vehicle endpoint only exposes published, non-deleted vehicles with filters."""
        v_pub = Vehicle.objects.create(
            name='Ferrari F8 Tributo',
            brand='Ferrari',
            model='F8',
            price=280000.00,
            fuel_type='Gasoline',
            is_published=True,
            is_deleted=False,
        )
        v_unpub = Vehicle.objects.create(
            name='Secret Concept Car',
            brand='Ferrari',
            price=500000.00,
            fuel_type='Electric',
            is_published=False,
            is_deleted=False,
        )
        v_deleted = Vehicle.objects.create(
            name='Scrapped Vehicle',
            brand='Ford',
            price=15000.00,
            fuel_type='Gasoline',
            is_published=True,
            is_deleted=True,
        )

        # Public list
        res = self.client.get(self.vehicles_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        returned_names = [v['name'] for v in res.data['vehicles']]
        self.assertIn('Ferrari F8 Tributo', returned_names)
        self.assertNotIn('Secret Concept Car', returned_names)
        self.assertNotIn('Scrapped Vehicle', returned_names)

        # Public detail for unpublished car must return 404
        unpub_url = reverse('vehicle_detail', kwargs={'pk': v_unpub.pk})
        res_detail = self.client.get(unpub_url)
        self.assertEqual(res_detail.status_code, status.HTTP_404_NOT_FOUND)

        # Search filter
        res_search = self.client.get(f"{self.vehicles_url}?search=Ferrari")
        self.assertEqual(res_search.status_code, status.HTTP_200_OK)
        self.assertTrue(all('ferrari' in v['brand'].lower() or 'ferrari' in v['name'].lower() for v in res_search.data['vehicles']))

    def test_admin_vehicle_crud_and_soft_delete(self):
        """Verify admin can create, update, toggle, and soft-delete vehicles."""
        admin = User.objects.create_user(
            username='manager@dealership.com',
            email='manager@dealership.com',
            password='AdminPassword123!',
            is_staff=True,
        )
        token = Token.objects.create(user=admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        # 1. Create vehicle
        payload = {
            'name': 'Aston Martin DB12',
            'brand': 'Aston Martin',
            'model': 'DB12',
            'year': 2024,
            'price': 245000.00,
            'fuel_type': 'Gasoline',
            'transmission': 'Automatic',
            'drivetrain': 'RWD',
            'horsepower': '671 HP',
            'description': 'Super Tourer defining pure high-performance luxury.',
            'is_published': True,
            'is_available': True,
        }
        res_create = self.client.post(self.admin_vehicles_url, payload, format='json')
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        v_id = res_create.data['vehicle']['id']

        # 2. Toggle publish
        toggle_pub_url = reverse('admin_vehicle_toggle_publish', kwargs={'pk': v_id})
        res_pub = self.client.post(toggle_pub_url)
        self.assertEqual(res_pub.status_code, status.HTTP_200_OK)
        self.assertFalse(res_pub.data['is_published'])

        # 3. Soft delete
        detail_url = reverse('admin_vehicle_detail', kwargs={'pk': v_id})
        res_del = self.client.delete(detail_url)
        self.assertEqual(res_del.status_code, status.HTTP_200_OK)

        # Vehicle must be marked is_deleted=True in DB, NOT deleted from database
        v_check = Vehicle.objects.get(pk=v_id)
        self.assertTrue(v_check.is_deleted)

    def test_booking_unavailable_vehicle_rejection(self):
        """Verify booking an unavailable or unpublished vehicle is rejected."""
        v_unavail = Vehicle.objects.create(
            name='Sold Classic Car',
            brand='Jaguar',
            price=120000.00,
            is_published=True,
            is_available=False,
            is_deleted=False,
        )
        user = User.objects.create_user(
            username='shopper@customer.com',
            email='shopper@customer.com',
            password='CustomerPass123!',
        )
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        # Attempt to book unavailable car
        booking_payload = {
            'car_id': v_unavail.id,
            'car_name': v_unavail.name,
            'preferred_date': '2026-11-20',
        }
        res = self.client.post(self.bookings_url, booking_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('unavailable or reserved', str(res.data.get('detail', '')))

    def test_admin_booking_approval_workflow(self):
        """Verify customer booking starts as Pending, and admin approval updates status."""
        v = Vehicle.objects.create(
            name='McLaren Artura',
            brand='McLaren',
            price=237500.00,
            is_published=True,
            is_available=True,
        )
        customer = User.objects.create_user(
            username='client1@test.com',
            email='client1@test.com',
            password='Password123!',
        )
        admin = User.objects.create_user(
            username='boss@dealership.com',
            email='boss@dealership.com',
            password='BossPassword123!',
            is_staff=True,
        )
        token_customer = Token.objects.create(user=customer)
        token_admin = Token.objects.create(user=admin)

        # 1. Customer creates booking -> must be Pending
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token_customer.key}')
        res_create = self.client.post(self.bookings_url, {
            'car_id': v.id,
            'car_name': v.name,
            'preferred_date': '2026-11-15',
        }, format='json')
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_create.data['booking']['status'], 'Pending')
        b_id = res_create.data['booking']['id']

        # 2. Customer cannot approve their own booking via admin endpoint
        res_tamper = self.client.patch(reverse('admin_booking_update', kwargs={'pk': b_id}), {
            'status': 'Confirmed',
        }, format='json')
        self.assertEqual(res_tamper.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Admin approves booking
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token_admin.key}')
        res_approve = self.client.patch(reverse('admin_booking_update', kwargs={'pk': b_id}), {
            'status': 'Confirmed',
            'admin_notes': 'VIP client assigned to Showroom Specialist John.',
        }, format='json')
        self.assertEqual(res_approve.status_code, status.HTTP_200_OK)
        self.assertEqual(res_approve.data['booking']['status'], 'Confirmed')

        # 4. Customer views bookings -> status is now Confirmed
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token_customer.key}')
        res_cust_view = self.client.get(self.bookings_url)
        self.assertEqual(res_cust_view.data['bookings'][0]['status'], 'Confirmed')

    def test_admin_enquiry_response_and_notes_isolation(self):
        """Verify admin can reply to enquiry and internal notes are not leaked to customer."""
        customer = User.objects.create_user(
            username='inquirer2@test.com',
            email='inquirer2@test.com',
            password='Password123!',
        )
        admin = User.objects.create_user(
            username='service@dealership.com',
            email='service@dealership.com',
            password='AdminPassword123!',
            is_staff=True,
        )
        token_customer = Token.objects.create(user=customer)
        token_admin = Token.objects.create(user=admin)

        # 1. Customer submits enquiry
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token_customer.key}')
        res_enq = self.client.post(self.enquiries_url, {
            'subject': 'Lease Calculator',
            'message': 'What are the 36-month lease rates?',
        }, format='json')
        self.assertEqual(res_enq.status_code, status.HTTP_201_CREATED)
        enq_id = res_enq.data['enquiry']['id']

        # 2. Admin adds response message and confidential internal note
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token_admin.key}')
        res_patch = self.client.patch(reverse('admin_enquiry_update', kwargs={'pk': enq_id}), {
            'response_message': '36-month lease is 2.9% APR with $5,000 down.',
            'admin_notes': 'CONFIDENTIAL: Customer pre-approved for $200k tier.',
        }, format='json')
        self.assertEqual(res_patch.status_code, status.HTTP_200_OK)
        self.assertEqual(res_patch.data['enquiry']['status'], 'Responded')

        # 3. Customer checks their enquiries
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token_customer.key}')
        res_cust = self.client.get(self.enquiries_url)
        cust_enquiry = res_cust.data['enquiries'][0]
        self.assertEqual(cust_enquiry['response_message'], '36-month lease is 2.9% APR with $5,000 down.')
        # CRUCIAL SECURITY CHECK: admin_notes MUST NEVER be in customer response
        self.assertNotIn('admin_notes', cust_enquiry)
