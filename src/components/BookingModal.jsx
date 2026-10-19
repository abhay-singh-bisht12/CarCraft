import React, { useState } from 'react';
import { X, Calendar, Clock, Phone, FileText, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Car } from 'lucide-react';
import { createBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookingModal({ car, isOpen, onClose, onSuccess }) {
  const { token, user } = useAuth();

  const [bookingType, setBookingType] = useState('test_drive');
  // Default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    preferredDate: defaultDateStr,
    preferredTime: 'Morning (10:00 AM - 1:00 PM)',
    contactPhone: user?.phone || '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen || !car) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (statusMessage) setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.preferredDate) {
      setStatusMessage({ type: 'error', text: 'Please select a preferred appointment date.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await createBooking(token, {
        carId: car.id,
        carName: car.name,
        bookingType,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        contactPhone: formData.contactPhone,
        notes: formData.notes,
      });

      setStatusMessage({
        type: 'success',
        text: res.message || 'Booking request confirmed! Our dealership concierge will contact you shortly.',
      });

      if (onSuccess) {
        onSuccess(res.booking);
      }

      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 1600);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to submit booking request. Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 text-slate-100 overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Car className="w-3.5 h-3.5" />
            <span>VIP Showroom Concierge</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Schedule Appointment
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Vehicle: <span className="text-amber-400 font-semibold">{car.name}</span> ({car.year})
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed font-medium">{statusMessage.text}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Booking Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setBookingType('test_drive')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                bookingType === 'test_drive'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Test Drive Experience
            </button>
            <button
              type="button"
              onClick={() => setBookingType('purchase_inquiry')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                bookingType === 'purchase_inquiry'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Purchase Consultation
            </button>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Preferred Date *</span>
              </label>
              <input
                type="date"
                name="preferredDate"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.preferredDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Time Window</span>
              </label>
              <select
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Contact Phone */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Contact Phone</span>
            </label>
            <input
              type="tel"
              name="contactPhone"
              placeholder="+1 (555) 000-0000"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Special Requests / Notes</span>
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g., Interested in track pack options, trade-in vehicle assessment..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-950 transition-all ${
                loading
                  ? 'bg-amber-400/60 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Submitting Reservation...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Booking Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
