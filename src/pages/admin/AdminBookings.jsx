import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Car,
  FileText,
  AlertCircle,
  Loader2,
  Check,
  RefreshCw,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAdminBookings, updateAdminBooking } from '../../services/api';

export default function AdminBookings() {
  const { token } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing notes modal / state
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeNoteEdit, setActiveNoteEdit] = useState(null); // { id, note }

  const fetchBookings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await getAdminBookings(token, statusFilter);
      setBookings(res?.bookings || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch customer bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token, statusFilter]);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateStatus = async (id, newStatus, currentCarName) => {
    try {
      setUpdatingId(id);
      const res = await updateAdminBooking(token, id, { status: newStatus });
      showToast(res.message);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      setError(err.message || 'Failed to update booking status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNote = async (id) => {
    try {
      setUpdatingId(id);
      await updateAdminBooking(token, id, { adminNotes: activeNoteEdit.note });
      showToast('Internal note saved.');
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, admin_notes: activeNoteEdit.note } : b))
      );
      setActiveNoteEdit(null);
    } catch (err) {
      setError(err.message || 'Failed to save admin note.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        b.car_name?.toLowerCase().includes(q) ||
        b.customer?.fullName?.toLowerCase().includes(q) ||
        b.customer?.email?.toLowerCase().includes(q) ||
        b.contact_phone?.includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Pending':
        return 'bg-amber-400/10 text-amber-400 border-amber-400/30';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Completed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-1">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Customer Appointment Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            VIP Test Drives & Consultations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review incoming requests from customers. Approved or rejected appointments reflect immediately on client accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors w-fit"
          title="Refresh bookings"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5 shadow-lg">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Status Filter Tabs */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, car, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab === 'all' ? 'All Requests' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List Cards */}
      {loading && bookings.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading bookings from database...</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl transition-all"
            >
              {/* Top row: Customer, Vehicle, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black text-sm">
                    {b.customer?.fullName?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{b.customer?.fullName || 'Client'}</span>
                      <span className="text-xs text-slate-400 font-normal">({b.customer?.email})</span>
                    </h3>
                    <p className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 mt-0.5">
                      <Car className="w-3.5 h-3.5" />
                      <span>{b.car_name}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 uppercase text-[10px] font-bold">
                        {b.booking_type === 'test_drive' ? 'Test Drive Experience' : 'Purchase Consultation'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusBadge(
                      b.status
                    )}`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>

              {/* Middle row: Schedule & Contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Preferred Date & Time
                  </span>
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{b.preferred_date} • {b.preferred_time}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Contact Phone
                  </span>
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{b.contact_phone || b.customer?.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/70 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Request Received
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span>{new Date(b.created_at).toLocaleDateString()} at {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {b.notes && (
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Client's Special Request / Note:
                  </span>
                  <p className="text-slate-300 italic">"{b.notes}"</p>
                </div>
              )}

              {/* Internal Admin Notes */}
              <div className="p-3 rounded-xl bg-slate-950/40 border border-amber-400/20 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Internal Dealership Notes (Staff Only)
                  </span>
                  {activeNoteEdit?.id !== b.id && (
                    <button
                      type="button"
                      onClick={() => setActiveNoteEdit({ id: b.id, note: b.admin_notes || '' })}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                    >
                      {b.admin_notes ? 'Edit Note' : '+ Add Note'}
                    </button>
                  )}
                </div>

                {activeNoteEdit?.id === b.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={activeNoteEdit.note}
                      onChange={(e) => setActiveNoteEdit({ ...activeNoteEdit, note: e.target.value })}
                      placeholder="e.g., Assigned vehicle key to John; client pre-approved for $120k loan."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveNoteEdit(null)}
                        className="px-2.5 py-1 rounded-lg text-[11px] text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNote(b.id)}
                        className="px-3 py-1 rounded-lg text-[11px] font-bold bg-amber-400 text-slate-950 hover:bg-amber-300"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">
                    {b.admin_notes ? b.admin_notes : 'No staff notes recorded.'}
                  </p>
                )}
              </div>

              {/* Action Buttons: Status Transitions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-slate-500">
                  ID: <span className="font-mono text-slate-400">#{b.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  {b.status !== 'Confirmed' && (
                    <button
                      type="button"
                      disabled={updatingId === b.id}
                      onClick={() => handleUpdateStatus(b.id, 'Confirmed', b.car_name)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Booking</span>
                    </button>
                  )}

                  {b.status === 'Confirmed' && (
                    <button
                      type="button"
                      disabled={updatingId === b.id}
                      onClick={() => handleUpdateStatus(b.id, 'Completed', b.car_name)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Completed</span>
                    </button>
                  )}

                  {b.status !== 'Cancelled' && (
                    <button
                      type="button"
                      disabled={updatingId === b.id}
                      onClick={() => handleUpdateStatus(b.id, 'Cancelled', b.car_name)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-amber-400 mx-auto flex items-center justify-center">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-white">No Bookings Found</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {statusFilter !== 'all'
              ? `No requests match status "${statusFilter}".`
              : 'No test-drive bookings have been submitted yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
