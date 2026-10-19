import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Send,
  User,
  Car,
  Mail,
  FileText,
  AlertCircle,
  Loader2,
  Check,
  RefreshCw,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAdminEnquiries, updateAdminEnquiry } from '../../services/api';

export default function AdminEnquiries() {
  const { token } = useAuth();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reply modal state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyData, setReplyData] = useState({
    status: 'Responded',
    responseMessage: '',
    adminNotes: '',
  });
  const [savingReply, setSavingReply] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchEnquiries = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await getAdminEnquiries(token, statusFilter);
      setEnquiries(res?.enquiries || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch customer enquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [token, statusFilter]);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenReplyModal = (e) => {
    setSelectedEnquiry(e);
    setReplyData({
      status: e.status === 'Received' ? 'Responded' : e.status,
      responseMessage: e.response_message || '',
      adminNotes: e.admin_notes || '',
    });
  };

  const handleSaveReply = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry || savingReply) return;

    try {
      setSavingReply(true);
      const res = await updateAdminEnquiry(token, selectedEnquiry.id, {
        status: replyData.status,
        responseMessage: replyData.responseMessage,
        adminNotes: replyData.adminNotes,
      });

      showToast(res.message);
      setEnquiries((prev) =>
        prev.map((item) => (item.id === selectedEnquiry.id ? res.enquiry : item))
      );
      setSelectedEnquiry(null);
    } catch (err) {
      setError(err.message || 'Failed to submit response.');
    } finally {
      setSavingReply(false);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        e.subject?.toLowerCase().includes(q) ||
        e.customer?.fullName?.toLowerCase().includes(q) ||
        e.customer?.email?.toLowerCase().includes(q) ||
        e.car_name?.toLowerCase().includes(q) ||
        e.message?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Customer Communications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Client Inquiries & Concierge Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review customer inquiries regarding lease financing, vehicle history, and custom specs. Replies reflect on the client's My Account page.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchEnquiries}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors w-fit"
          title="Refresh enquiries"
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

      {/* Search & Filter Tabs */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, subject, vehicle, or keyword..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          {['all', 'Received', 'In Review', 'Responded'].map((tab) => (
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
              {tab === 'all' ? 'All Inquiries' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries List */}
      {loading && enquiries.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading inquiries from database...</p>
        </div>
      ) : filteredEnquiries.length > 0 ? (
        <div className="space-y-4">
          {filteredEnquiries.map((e) => (
            <div
              key={e.id}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {e.customer?.fullName || e.customer?.email}
                    </span>
                    <span className="text-xs text-slate-400">({e.customer?.email})</span>
                  </div>
                  <h3 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                    <span>{e.subject}</span>
                    {e.car_name && (
                      <span className="text-xs text-slate-400 font-semibold">• {e.car_name}</span>
                    )}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      e.status === 'Responded'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : e.status === 'In Review'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
              </div>

              {/* Customer's Query */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Customer Message:
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  "{e.message}"
                </p>
              </div>

              {/* Dealership Response (if sent) */}
              {e.response_message && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <Send className="w-3 h-3" />
                    <span>Customer-Visible Response:</span>
                  </span>
                  <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
                    {e.response_message}
                  </p>
                </div>
              )}

              {/* Internal Admin Note */}
              {e.admin_notes && (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-amber-400/20 text-xs flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                      Internal Staff Note (Never shared with customer):
                    </span>
                    <p className="text-slate-400 italic mt-0.5">{e.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Footer row: Date & Reply action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-slate-500 text-[11px]">
                  Submitted on {new Date(e.created_at).toLocaleDateString()} at {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenReplyModal(e)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{e.response_message ? 'Edit Response' : 'Reply to Client'}</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-amber-400 mx-auto flex items-center justify-center">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-white">No Inquiries Found</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {statusFilter !== 'all'
              ? `No inquiries match status "${statusFilter}".`
              : 'No customer inquiries have been submitted yet.'}
          </p>
        </div>
      )}

      {/* Reply Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-5">
            <button
              type="button"
              onClick={() => setSelectedEnquiry(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
                Respond to Client
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {selectedEnquiry.subject}
              </h3>
              <p className="text-xs text-slate-400">
                To: <strong className="text-slate-200">{selectedEnquiry.customer?.email}</strong>
              </p>
            </div>

            <form onSubmit={handleSaveReply} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Handling Status
                </label>
                <select
                  value={replyData.status}
                  onChange={(e) => setReplyData({ ...replyData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="In Review">In Review</option>
                  <option value="Responded">Responded</option>
                  <option value="Received">Received (Pending)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Customer-Visible Response Message</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyData.responseMessage}
                  onChange={(e) => setReplyData({ ...replyData, responseMessage: e.target.value })}
                  placeholder="Type your response to the customer. This message will appear on their personal My Account portal..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Private Internal Notes (Staff Only)</span>
                </label>
                <textarea
                  rows={2}
                  value={replyData.adminNotes}
                  onChange={(e) => setReplyData({ ...replyData, adminNotes: e.target.value })}
                  placeholder="Confidential notes (e.g. VIP client budget, assigned specialist). Never shown to client."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReply}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20"
                >
                  {savingReply ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Response</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
