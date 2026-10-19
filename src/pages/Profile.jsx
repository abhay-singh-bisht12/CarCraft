import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Heart,
  MessageSquare,
  Car,
  Clock,
  ChevronRight,
  X,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getProfile,
  updateProfile,
  getBookings,
  getEnquiries,
  getFavourites,
  toggleFavourite,
  getVehicles,
} from '../services/api';
import { sampleCars } from '../data/cars';

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const [catalogCars, setCatalogCars] = useState(sampleCars);

  // Active Tab state: 'profile' | 'bookings' | 'enquiries' | 'wishlist'
  const [activeTab, setActiveTab] = useState('profile');

  // Profile data & edit mode states
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateJoined: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Tab Data states
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [enquiries, setEnquiries] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  const [favourites, setFavourites] = useState([]);
  const [loadingFavourites, setLoadingFavourites] = useState(false);

  // 1. Fetch live profile details on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      if (!token) return;
      setProfileLoading(true);
      try {
        const data = await getProfile(token);
        if (isMounted && data?.user) {
          setProfileData(data.user);
          setEditFormData({
            fullName: data.user.fullName || '',
            phone: data.user.phone || '',
          });
        }
      } catch (err) {
        // Fallback to auth context if offline
        if (isMounted && user) {
          setProfileData({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            dateJoined: '',
          });
          setEditFormData({
            fullName: user.fullName || '',
            phone: user.phone || '',
          });
        }
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    }
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [token, user]);

  // Fetch live showroom vehicles for wishlist matching
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const res = await getVehicles();
        if (isMounted && res?.vehicles && Array.isArray(res.vehicles) && res.vehicles.length > 0) {
          setCatalogCars(res.vehicles);
        }
      } catch {
        // Fallback to sampleCars
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch tab data when active tab changes
  useEffect(() => {
    let isMounted = true;
    if (!token) return;

    if (activeTab === 'bookings') {
      setLoadingBookings(true);
      getBookings(token)
        .then((res) => {
          if (isMounted && res?.bookings) setBookings(res.bookings);
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoadingBookings(false);
        });
    } else if (activeTab === 'enquiries') {
      setLoadingEnquiries(true);
      getEnquiries(token)
        .then((res) => {
          if (isMounted && res?.enquiries) setEnquiries(res.enquiries);
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoadingEnquiries(false);
        });
    } else if (activeTab === 'wishlist') {
      setLoadingFavourites(true);
      getFavourites(token)
        .then((res) => {
          if (isMounted && res?.favourites) setFavourites(res.favourites);
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoadingFavourites(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab, token]);

  const handleStartEditing = () => {
    setEditFormData({
      fullName: profileData.fullName || '',
      phone: profileData.phone || '',
    });
    setProfileSuccess(null);
    setProfileError(null);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setProfileError(null);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (savingProfile) return;

    // Validate full name
    if (!editFormData.fullName.trim()) {
      setProfileError('Full name cannot be blank.');
      return;
    }
    if (editFormData.fullName.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters long.');
      return;
    }

    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await updateProfile(token, {
        fullName: editFormData.fullName.trim(),
        phone: editFormData.phone.trim(),
      });

      if (res?.user) {
        setProfileData(res.user);
        // Immediately update shared AuthContext so Navbar name refreshes seamlessly
        updateUser(res.user);
      }

      setProfileSuccess(res.message || 'Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile. Please check your input.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemoveFavourite = async (carId, carName) => {
    try {
      await toggleFavourite(token, { carId, carName });
      setFavourites((prev) => prev.filter((item) => item.car_id !== carId));
    } catch (err) {
      // ignore
    }
  };

  const formattedDate = (dateStr) => {
    if (!dateStr) return 'Active Member';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-amber-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200 font-medium">My Account</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 mb-8 shadow-2xl backdrop-blur-xl">
          {/* Ambient Gold Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Avatar Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-2xl sm:text-3xl shadow-lg shadow-amber-500/20 shrink-0">
                {profileData.fullName
                  ? profileData.fullName.charAt(0).toUpperCase()
                  : profileData.email.charAt(0).toUpperCase()}
              </div>

              {/* User Bio */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Dealership Client</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {profileData.fullName || 'Valued Client'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                  <span>{profileData.email}</span>
                  {profileData.phone && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span>{profileData.phone}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Stats or Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Member Since
                </span>
                <span className="text-slate-200 font-bold">
                  {formattedDate(profileData.dateJoined)}
                </span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Portal Tier
                </span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  VIP Concierge
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-slate-800/80 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Bookings</span>
            {bookings.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  activeTab === 'bookings' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {bookings.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('enquiries')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'enquiries'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>My Enquiries</span>
            {enquiries.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  activeTab === 'enquiries' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {enquiries.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'wishlist'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Wishlist</span>
            {favourites.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  activeTab === 'wishlist' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {favourites.length}
              </span>
            )}
          </button>
        </div>

        {/* Status Alerts */}
        {profileSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">{profileSuccess}</div>
          </div>
        )}

        {profileError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">{profileError}</div>
          </div>
        )}

        {/* Tab 1: Profile Details & Edit */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Details Card */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">Client Information</h3>
                  <p className="text-xs text-slate-400">
                    Your personal dealership profile and contact specifications.
                  </p>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    disabled={savingProfile}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              {profileLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <span className="text-xs text-slate-400">Loading profile data...</span>
                </div>
              ) : isEditing ? (
                /* Edit Profile Form */
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Full Name <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        required
                        disabled={savingProfile}
                        value={editFormData.fullName}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, fullName: e.target.value })
                        }
                        placeholder="e.g., Alexander Vance"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Email (Read-Only) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Email Address (Read-Only)
                      </label>
                      <span className="text-[11px] text-amber-400/80 font-medium">
                        Secured Identity
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        disabled
                        value={profileData.email}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800/60 rounded-xl text-sm text-slate-400 cursor-not-allowed select-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Primary email is cryptographically bound to your account token.
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        disabled={savingProfile}
                        value={editFormData.phone}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, phone: e.target.value })
                        }
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Save Actions */}
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className={`inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-slate-950 transition-all cursor-pointer ${
                        savingProfile
                          ? 'bg-amber-400/60 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20'
                      }`}
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEditing}
                      disabled={savingProfile}
                      className="px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Read Mode Details Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Full Legal Name
                    </span>
                    <p className="text-base font-bold text-white">
                      {profileData.fullName || 'Not provided'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Primary Email
                    </span>
                    <p className="text-base font-bold text-white break-all">
                      {profileData.email}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Contact Phone
                    </span>
                    <p className="text-base font-bold text-white">
                      {profileData.phone || 'No phone registered'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Account Registered
                    </span>
                    <p className="text-base font-bold text-white">
                      {formattedDate(profileData.dateJoined)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Side Information: Dealership Privileges */}
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Security & Integrity</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your profile edits are secured through Django REST Framework's TokenAuthentication.
                  All database modifications verify your cryptographic auth token on every transaction.
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                  User ID: <span className="font-mono text-slate-400">{profileData.id}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-400/20 rounded-3xl p-6 sm:p-7 shadow-xl space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
                  Showroom Access
                </span>
                <h4 className="text-base font-bold text-white">Private Appointments</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Schedule bespoke test drives and inquire directly with our luxury vehicle consultants.
                </p>
                <Link
                  to="/cars"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 pt-1 transition-colors"
                >
                  <span>Browse Available Inventory</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: My Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Test Drive & Purchase Appointments</h3>
                <p className="text-xs text-slate-400">
                  Track upcoming vehicle appointments and showroom consultations.
                </p>
              </div>

              <Link
                to="/cars"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors w-fit"
              >
                <Car className="w-4 h-4" />
                <span>Book Another Vehicle</span>
              </Link>
            </div>

            {loadingBookings ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
                <p className="text-xs text-slate-400">Loading your scheduled bookings...</p>
              </div>
            ) : bookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                          {b.booking_type === 'test_drive' ? 'Test Drive Experience' : 'Purchase Consultation'}
                        </span>
                        <h4 className="text-base font-bold text-white">{b.car_name}</h4>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : b.status === 'Completed'
                            ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                            : b.status === 'Cancelled'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-amber-400/15 text-amber-400 border-amber-400/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{b.preferred_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{b.preferred_time}</span>
                      </div>
                    </div>

                    {b.notes && (
                      <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
                        "{b.notes}"
                      </p>
                    )}

                    <div className="text-[10px] text-slate-500 pt-1">
                      Submitted on {formattedDate(b.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-12 text-center max-w-lg mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-amber-400 mx-auto flex items-center justify-center">
                  <Calendar className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-white">No Bookings Yet</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You haven't scheduled any test drives or purchase consultations. Browse our inventory to book an experience with your dream car.
                </p>
                <Link
                  to="/cars"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
                >
                  <span>Browse Showroom Vehicles</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Dealership Inquiries</h3>
              <p className="text-xs text-slate-400">
                Messages, lease inquiries, and concierge requests submitted to CarCraft.
              </p>
            </div>

            {loadingEnquiries ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
                <p className="text-xs text-slate-400">Loading your enquiries...</p>
              </div>
            ) : enquiries.length > 0 ? (
              <div className="space-y-4">
                {enquiries.map((e) => (
                  <div
                    key={e.id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          {e.car_name || 'General Inquiry'}
                        </span>
                        <h4 className="text-base font-bold text-white">{e.subject}</h4>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border w-fit ${
                          e.status === 'Responded'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : e.status === 'In Review'
                            ? 'bg-amber-400/15 text-amber-400 border-amber-400/30'
                            : e.status === 'Closed'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                        }`}
                      >
                        {e.status}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                      {e.message}
                    </p>

                    {/* Official Dealership Response if available */}
                    {e.response_message && (
                      <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/30 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Dealership Official Response</span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                          {e.response_message}
                        </p>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Submitted on {formattedDate(e.created_at)}</span>
                      <span className="text-slate-400">
                        {e.response_message ? 'Responded by CarCraft Specialist' : 'Dealership specialist notified'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-12 text-center max-w-lg mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-amber-400 mx-auto flex items-center justify-center">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-white">No Inquiries Submitted</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Have questions about pricing, financing, or custom vehicle specs? Inquire directly on any vehicle card in our showroom.
                </p>
                <Link
                  to="/cars"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
                >
                  <span>Browse Cars & Inquire</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Saved Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Saved Vehicle Wishlist</h3>
                <p className="text-xs text-slate-400">
                  Vehicles you have saved for future inspection and test drives.
                </p>
              </div>

              <Link
                to="/cars"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors w-fit"
              >
                <Car className="w-4 h-4" />
                <span>Explore More Cars</span>
              </Link>
            </div>

            {loadingFavourites ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
                <p className="text-xs text-slate-400">Loading your saved vehicles...</p>
              </div>
            ) : favourites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favourites.map((fav) => {
                  // Find full details from live database catalog or sampleCars
                  const carDetail =
                    catalogCars.find((c) => Number(c.id) === Number(fav.car_id)) ||
                    sampleCars.find((c) => Number(c.id) === Number(fav.car_id));

                  return (
                    <div
                      key={fav.id}
                      className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between"
                    >
                      {carDetail && (
                        <div className="relative h-44 overflow-hidden bg-slate-950">
                          <img
                            src={carDetail.image}
                            alt={carDetail.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 right-2.5">
                            <button
                              type="button"
                              onClick={() => handleRemoveFavourite(fav.car_id, fav.car_name)}
                              className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-500/20 text-rose-400 border border-slate-700/80 transition-colors"
                              title="Remove from wishlist"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className="text-base font-bold text-white">
                            {carDetail?.name || fav.car_name}
                          </h4>
                          {carDetail && (
                            <p className="text-xs text-amber-400 font-semibold mt-1">
                              ${carDetail.price.toLocaleString()} • {carDetail.horsepower}
                            </p>
                          )}
                          <span className="text-[10px] text-slate-500 block mt-2">
                            Saved on {formattedDate(fav.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <Link
                            to="/cars"
                            className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
                          >
                            View in Showroom
                          </Link>
                          {!carDetail && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFavourite(fav.car_id, fav.car_name)}
                              className="p-2 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-12 text-center max-w-lg mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-rose-400 mx-auto flex items-center justify-center">
                  <Heart className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-white">Your Wishlist is Empty</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click the heart icon on any vehicle card in the showroom to save it here for easy access.
                </p>
                <Link
                  to="/cars"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
                >
                  <span>Explore Showroom</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
