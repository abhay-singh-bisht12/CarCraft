// CarCraft API Service
// Connects React frontend to the Django REST Framework backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

/**
 * Handle HTTP responses and parse structured error messages
 */
async function handleResponse(response) {
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (data) {
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.detail) {
        errorMessage = data.detail;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else {
        // Collect first field error if dictionary of errors
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const val = data[firstKey];
          errorMessage = Array.isArray(val) ? val[0] : String(val);
        }
      }
    } else {
      errorMessage = `Server returned status ${response.status}: ${response.statusText}`;
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Register a new user account with the Django backend
 */
export async function registerUser({ fullName, email, phone, password, confirmPassword }) {
  try {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        password,
        confirmPassword,
      }),
    });

    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        'Unable to connect to the CarCraft backend server. Please verify the Django server is running on port 8000.'
      );
    }
    throw err;
  }
}

/**
 * Authenticate a user with email and password against the Django backend.
 * Returns secure auth token and user profile details.
 */
export async function loginUser({ email, password, rememberMe }) {
  try {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        rememberMe,
      }),
    });

    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        'Unable to connect to the CarCraft backend server. Please verify the Django server is running on port 8000.'
      );
    }
    throw err;
  }
}

/**
 * Securely verify the client's token with the backend and retrieve user profile.
 */
export async function getMe(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });

    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to the CarCraft backend server.');
    }
    throw err;
  }
}

/**
 * Invalidate the authentication token and session on the backend.
 */
export async function logoutUser(token) {
  try {
    if (!token) return { success: true };

    const response = await fetch(`${API_BASE_URL}/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });

    return await handleResponse(response);
  } catch (err) {
    // Even if network fails during logout, local state will still be cleared
    return { success: false, error: err.message };
  }
}

/**
 * Check backend health
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health/`);
    return await handleResponse(response);
  } catch (err) {
    throw new Error('Backend health check failed: ' + err.message);
  }
}

/**
 * Retrieve authenticated user's profile from the backend
 */
export async function getProfile(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Update authenticated user's profile (fullName and phone)
 */
export async function updateProfile(token, { fullName, phone }) {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ fullName, phone }),
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Get client's personal bookings (test drives, purchase inquiries)
 */
export async function getBookings(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Submit a new test drive or purchase booking request
 */
export async function createBooking(token, bookingData) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        car_id: bookingData.carId,
        car_name: bookingData.carName,
        booking_type: bookingData.bookingType || 'test_drive',
        preferred_date: bookingData.preferredDate,
        preferred_time: bookingData.preferredTime || 'Morning (10:00 AM - 1:00 PM)',
        contact_phone: bookingData.contactPhone || '',
        notes: bookingData.notes || '',
      }),
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Get client's personal inquiries
 */
export async function getEnquiries(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/enquiries/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Submit a new dealership inquiry for a vehicle
 */
export async function createEnquiry(token, enquiryData) {
  try {
    const response = await fetch(`${API_BASE_URL}/enquiries/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        car_id: enquiryData.carId || null,
        car_name: enquiryData.carName || '',
        subject: enquiryData.subject,
        message: enquiryData.message,
      }),
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Retrieve saved favourites for authenticated client
 */
export async function getFavourites(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/favourites/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Toggle favourite (add/remove) for authenticated client
 */
export async function toggleFavourite(token, { carId, carName }) {
  try {
    const response = await fetch(`${API_BASE_URL}/favourites/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        car_id: carId,
        car_name: carName,
      }),
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

// ==========================================
// SHARED VEHICLE INVENTORY (DATABASE BACKED)
// ==========================================

/**
 * Fetch published vehicles from the shared database with optional filters
 */
export async function getVehicles(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.minPrice) query.append('min_price', params.minPrice);
    if (params.maxPrice) query.append('max_price', params.maxPrice);
    if (params.fuelType && params.fuelType !== 'all') query.append('fuel_type', params.fuelType);
    if (params.transmission && params.transmission !== 'all') query.append('transmission', params.transmission);
    if (params.sortBy) query.append('sort', params.sortBy);

    const queryString = query.toString();
    const url = `${API_BASE_URL}/vehicles/${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to load vehicles from dealership server.');
    }
    throw err;
  }
}

/**
 * Fetch a single vehicle's full details by ID
 */
export async function getVehicle(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}/`);
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

// ==========================================
// DEALERSHIP ADMIN PORTAL APIS (STAFF ONLY)
// ==========================================

/**
 * Fetch dealership overview metrics and recent activity
 */
export async function getAdminOverview(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/overview/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * List all vehicles (published, unpublished, available, reserved)
 */
export async function getAdminVehicles(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vehicles/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Create a new vehicle in the dealership inventory
 */
export async function createAdminVehicle(token, vehicleData) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vehicles/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(vehicleData),
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Update an existing vehicle in inventory
 */
export async function updateAdminVehicle(token, id, vehicleData) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vehicles/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(vehicleData),
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Soft-delete / archive a vehicle from inventory
 */
export async function deleteAdminVehicle(token, id) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vehicles/${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Toggle whether a vehicle is published to the public customer showroom
 */
export async function toggleAdminVehiclePublish(token, id) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vehicles/${id}/toggle-publish/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Toggle whether a vehicle is available for customer booking
 */
export async function toggleAdminVehicleAvailability(token, id) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vehicles/${id}/toggle-availability/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * List all customer bookings across all clients (optional filter by status)
 */
export async function getAdminBookings(token, statusFilter = '') {
  try {
    const query = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : '';
    const response = await fetch(`${API_BASE_URL}/admin/bookings/${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Approve, reject, or update status/notes of a customer booking
 */
export async function updateAdminBooking(token, id, { status, adminNotes }) {
  try {
    const payload = {};
    if (status) payload.status = status;
    if (adminNotes !== undefined) payload.admin_notes = adminNotes;

    const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * List all customer enquiries (optional filter by status)
 */
export async function getAdminEnquiries(token, statusFilter = '') {
  try {
    const query = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : '';
    const response = await fetch(`${API_BASE_URL}/admin/enquiries/${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Update enquiry handling status, reply to customer, or add private admin notes
 */
export async function updateAdminEnquiry(token, id, { status, responseMessage, adminNotes }) {
  try {
    const payload = {};
    if (status) payload.status = status;
    if (responseMessage !== undefined) payload.response_message = responseMessage;
    if (adminNotes !== undefined) payload.admin_notes = adminNotes;

    const response = await fetch(`${API_BASE_URL}/admin/enquiries/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * List registered dealership customers
 */
export async function getAdminCustomers(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/customers/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to CarCraft server.');
    }
    throw err;
  }
}

/**
 * Check backend system health and database connectivity
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health/`);
    return await handleResponse(response);
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Backend service is unreachable.');
    }
    throw err;
  }
}
