import React, { useState } from 'react';
import { X, MessageSquare, Mail, Send, CheckCircle2, AlertCircle, Loader2, Car } from 'lucide-react';
import { createEnquiry } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EnquiryModal({ car, isOpen, onClose, onSuccess }) {
  const { token, user } = useAuth();

  const [formData, setFormData] = useState({
    subject: car ? `Vehicle Inquiry: ${car.name}` : 'General Dealership Inquiry',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (statusMessage) setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.subject.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide a subject for your enquiry.' });
      return;
    }

    if (!formData.message.trim()) {
      setStatusMessage({ type: 'error', text: 'Please write your message or question.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await createEnquiry(token, {
        carId: car?.id || null,
        carName: car?.name || '',
        subject: formData.subject,
        message: formData.message,
      });

      setStatusMessage({
        type: 'success',
        text: res.message || 'Enquiry submitted successfully! A dealership representative will reply soon.',
      });

      if (onSuccess) {
        onSuccess(res.enquiry);
      }

      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 1600);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to submit enquiry. Please check your network and try again.',
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
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Dealership Sales & Concierge</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Send an Inquiry
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            {car ? (
              <>Vehicle: <span className="text-amber-400 font-semibold">{car.name}</span></>
            ) : (
              'Ask about vehicle availability, lease terms, or custom delivery.'
            )}
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
          {/* Subject Field */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Message Area */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Message / Questions *
            </label>
            <textarea
              name="message"
              required
              rows={4}
              placeholder="Inquire about lease rates, vehicle history reports, warranty coverage, or trade-in valuations..."
              value={formData.message}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>Replies will be sent to <strong className="text-slate-200">{user?.email}</strong></span>
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
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
