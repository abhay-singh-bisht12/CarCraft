import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  CalendarCheck,
  MessageSquare,
  ShieldCheck,
  Shield,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAdminCustomers } from '../../services/api';

export default function AdminCustomers() {
  const { token } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await getAdminCustomers(token);
      setCustomers(res?.customers || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load customer list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        c.fullName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q);
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
            <Users className="w-3.5 h-3.5" />
            <span>Client Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Registered Dealership Clients
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real customer accounts registered in the database, including lifetime appointments and inquiry counts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCustomers}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors w-fit"
          title="Refresh customer registry"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Customer Registry Table */}
      {loading && customers.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading client registry from database...</p>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Client Name</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Account Type</th>
                  <th className="py-3.5 px-4">Activity Stats</th>
                  <th className="py-3.5 px-4 sm:px-6">Date Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/50 transition-colors">
                    {/* Name & Avatar */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {c.fullName ? c.fullName.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{c.fullName}</p>
                          <p className="text-[11px] text-slate-400">User ID #{c.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="w-3.5 h-3.5 text-amber-400" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Role / Account status */}
                    <td className="py-4 px-4">
                      {c.isStaff ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                          <Shield className="w-3 h-3" />
                          <span>Staff / Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Customer</span>
                        </span>
                      )}
                    </td>

                    {/* Activity */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-300" title="Bookings">
                          <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                          <strong className="text-white">{c.totalBookings}</strong>
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1 text-slate-300" title="Inquiries">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                          <strong className="text-white">{c.totalEnquiries}</strong>
                        </span>
                      </div>
                    </td>

                    {/* Registered Date */}
                    <td className="py-4 px-4 sm:px-6 text-slate-400 text-xs">
                      {new Date(c.dateJoined).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-amber-400 mx-auto flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-white">No Customers Found</h4>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? `No clients matched "${searchQuery}".`
              : 'No registered customer accounts found.'}
          </p>
        </div>
      )}
    </div>
  );
}
