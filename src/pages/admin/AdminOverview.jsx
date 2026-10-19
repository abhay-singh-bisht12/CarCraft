import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  CalendarCheck,
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAdminOverview, updateAdminBooking } from '../../services/api';

export default function AdminOverview() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchOverview = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await getAdminOverview(token);
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dealership overview data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [token]);

  const handleQuickApprove = async (bookingId, carName) => {
    try {
      await updateAdminBooking(token, bookingId, { status: 'Confirmed' });
      setActionMessage(`Booking #${bookingId} for ${carName} approved!`);
      fetchOverview();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update booking status.');
    }
  };

  const handleQuickReject = async (bookingId, carName) => {
    try {
      await updateAdminBooking(token, bookingId, { status: 'Cancelled' });
      setActionMessage(`Booking #${bookingId} for ${carName} rejected.`);
      fetchOverview();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update booking status.');
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
          Synchronizing Dealership Dashboard...
        </p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalVehicles: 0,
    availableVehicles: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalEnquiries: 0,
    openEnquiries: 0,
    totalCustomers: 0,
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Dealership Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Operational Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dealership Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time management for vehicle inventory, test-drive requests, and customer communications.
          </p>
        </div>

        {/* Quick Add Vehicle CTA */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/vehicles"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Inventory</span>
          </Link>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Vehicles */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Showroom Inventory</span>
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{metrics.totalVehicles}</div>
            <p className="text-xs text-slate-400 mt-1">
              <strong className="text-emerald-400">{metrics.availableVehicles}</strong> active & available
            </p>
          </div>
          <Link
            to="/admin/vehicles"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 pt-1"
          >
            <span>View vehicles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Pending Bookings */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Bookings</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-400 flex items-center gap-2">
              <span>{metrics.pendingBookings}</span>
              {metrics.pendingBookings > 0 && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Action Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {metrics.totalBookings} total appointments
            </p>
          </div>
          <Link
            to="/admin/bookings?status=Pending"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 pt-1"
          >
            <span>Review requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Open Inquiries */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Open Enquiries</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{metrics.openEnquiries}</div>
            <p className="text-xs text-slate-400 mt-1">
              {metrics.totalEnquiries} total received
            </p>
          </div>
          <Link
            to="/admin/enquiries"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 pt-1"
          >
            <span>Reply to clients</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Registered Customers */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Clients</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{metrics.totalCustomers}</div>
            <p className="text-xs text-slate-400 mt-1">
              Active dealership accounts
            </p>
          </div>
          <Link
            to="/admin/customers"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 pt-1"
          >
            <span>View clients</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid: Recent Bookings & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Bookings Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Booking Requests</h3>
              <p className="text-xs text-slate-400">Latest test drive appointments submitted by clients.</p>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
            >
              <span>All bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.recentBookings?.length > 0 ? (
            <div className="space-y-3">
              {data.recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {b.customer?.fullName || b.customer?.email}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : b.status === 'Cancelled'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-amber-400 font-semibold truncate">
                      {b.car_name}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{b.preferred_date}</span>
                      <span>•</span>
                      <span className="truncate">{b.preferred_time}</span>
                    </p>
                  </div>

                  {b.status === 'Pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuickApprove(b.id, b.car_name)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors"
                        title="Approve Booking"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickReject(b.id, b.car_name)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors"
                        title="Reject Booking"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No booking requests logged yet.
            </div>
          )}
        </div>

        {/* Recent Enquiries Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Customer Inquiries</h3>
              <p className="text-xs text-slate-400">Questions regarding pricing, financing, and vehicle specs.</p>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
            >
              <span>All enquiries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.recentEnquiries?.length > 0 ? (
            <div className="space-y-3">
              {data.recentEnquiries.map((e) => (
                <div
                  key={e.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        {e.customer?.fullName || e.customer?.email}
                      </span>
                      <p className="text-[11px] text-amber-400 font-semibold truncate">
                        {e.subject} {e.car_name ? `(${e.car_name})` : ''}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                        e.status === 'Responded'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : e.status === 'In Review'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                      }`}
                    >
                      {e.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
                    "{e.message}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No inquiries received yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
