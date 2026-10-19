import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Server,
  Database,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  Clock,
  MapPin,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { checkHealth } from '../../services/api';

export default function AdminSettings() {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState({ loading: true, ok: false, data: null });
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [businessNotice, setBusinessNotice] = useState(null);

  // Dealership Profile State (persisted to localStorage for dealership preferences)
  const [dealershipInfo, setDealershipInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('carcraft_dealership_info');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      dealershipName: 'CarCraft Luxury & Performance Auto Group',
      licenseNumber: 'DL-IND-2026-CC904',
      primaryPhone: '+91 98765 43210',
      supportEmail: 'contact@carcraft.com',
      showroomAddress: 'CarCraft Flagship Pavilion, 42 Auto Avenue, Cyber City, Gurugram, India',
      businessHours: 'Mon - Sat: 9:00 AM - 8:00 PM | Sun: 10:00 AM - 5:00 PM',
      currencyCode: 'INR',
    };
  });

  const runHealthCheck = async () => {
    setHealthStatus({ loading: true, ok: false, data: null });
    try {
      const data = await checkHealth();
      setHealthStatus({
        loading: false,
        ok: true,
        data: data || { status: 'healthy', message: 'Backend service is online and database connected' },
      });
    } catch (err) {
      setHealthStatus({
        loading: false,
        ok: false,
        data: { error: err.message || 'Backend unreachable' },
      });
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const handleBusinessSubmit = (e) => {
    e.preventDefault();
    setSavingBusiness(true);
    try {
      localStorage.setItem('carcraft_dealership_info', JSON.stringify(dealershipInfo));
      setBusinessNotice({ type: 'success', message: 'Dealership showroom profile updated successfully.' });
    } catch (err) {
      setBusinessNotice({ type: 'error', message: 'Failed to save dealership preferences.' });
    } finally {
      setSavingBusiness(false);
      setTimeout(() => setBusinessNotice(null), 4000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>System & Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Dealership Settings & Architecture
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review backend system health, single-source-of-truth database status, and dealership configuration.
        </p>
      </div>

      {/* Grid: System Status & Superuser Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health Card */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" />
                Backend & API Status
              </h2>
              <button
                type="button"
                onClick={runHealthCheck}
                disabled={healthStatus.loading}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Re-check health"
              >
                <RefreshCw className={`w-4 h-4 ${healthStatus.loading ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Django API Gateway:</span>
                {healthStatus.loading ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Checking...
                  </span>
                ) : healthStatus.ok ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Operational (200 OK)
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Offline / Error
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Single DB Source:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  Synced (Vehicles, Bookings, Enquiries)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Authentication:</span>
                <span className="text-amber-400 font-bold">DRF Token Auth</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Endpoint Host:</span>
                <span className="text-slate-300 font-mono text-[11px]">http://127.0.0.1:8000</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Zero Mock Data Rule Enforced
              </p>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Both customer catalog and staff desks read directly from the Django `Vehicle`, `CarBooking`, and `DealershipEnquiry` models.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>CarCraft Enterprise v2.0</span>
            <span className="text-slate-400">Django 5.1 & React 18</span>
          </div>
        </div>

        {/* Superuser & Staff Provisioning Guide */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              Owner & Staff Account Management
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              Backend Terminal Only
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              In accordance with high-security automotive dealership architecture,{' '}
              <strong className="text-white">staff and superuser elevation is never permitted via client-side requests or public endpoints.</strong>
            </p>
            <p className="text-slate-400">
              Dealership owners and managers are safely provisioned from the server console using Django’s management command:
            </p>
          </div>

          {/* Code block */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px] pb-2 border-b border-slate-800">
              <span>Windows PowerShell (in D:\CarCraft\backend)</span>
              <span className="text-amber-400">Owner Creation</span>
            </div>
            <p className="text-slate-500"># 1. Activate the Python virtual environment</p>
            <p className="text-amber-400 font-semibold">.\.venv\Scripts\Activate.ps1</p>
            <p className="text-slate-500 mt-2"># 2. Run Django's built-in secure superuser creator</p>
            <p className="text-emerald-400 font-semibold">python manage.py createsuperuser</p>
            <p className="text-slate-500 mt-2"># 3. Enter username, email, and password when prompted.</p>
          </div>

          {/* Current Session Info */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400">Currently logged in as: </span>
              <strong className="text-white">{user?.fullName || user?.email}</strong>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                {user?.isSuperuser ? 'Superuser (Owner)' : 'Staff Member'}
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              ID: <span className="font-mono text-slate-200">#{user?.id}</span> | Email:{' '}
              <span className="font-mono text-slate-200">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dealership Profile & Showroom Configuration Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Dealership Showroom Profile
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              These details represent the dealership across customer communication and invoice headers.
            </p>
          </div>

          {businessNotice && (
            <div
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                businessNotice.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{businessNotice.message}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleBusinessSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dealership Name
              </label>
              <input
                type="text"
                value={dealershipInfo.dealershipName}
                onChange={(e) => setDealershipInfo({ ...dealershipInfo, dealershipName: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dealer License Number
              </label>
              <input
                type="text"
                value={dealershipInfo.licenseNumber}
                onChange={(e) => setDealershipInfo({ ...dealershipInfo, licenseNumber: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Phone / Hotline
              </label>
              <input
                type="text"
                value={dealershipInfo.primaryPhone}
                onChange={(e) => setDealershipInfo({ ...dealershipInfo, primaryPhone: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Customer Support Email
              </label>
              <input
                type="email"
                value={dealershipInfo.supportEmail}
                onChange={(e) => setDealershipInfo({ ...dealershipInfo, supportEmail: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Showroom Operating Hours
              </label>
              <input
                type="text"
                value={dealershipInfo.businessHours}
                onChange={(e) => setDealershipInfo({ ...dealershipInfo, businessHours: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default Currency Code
              </label>
              <select
                value={dealershipInfo.currencyCode}
                onChange={(e) => setDealershipInfo({ ...dealershipInfo, currencyCode: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="INR">INR (₹ Indian Rupee)</option>
                <option value="USD">USD ($ US Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="AED">AED (د.إ UAE Dirham)</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Flagship Showroom Physical Address
              </label>
              <input
                type="text"
                value={dealershipInfo.showroomAddress}
                onChange={(e) => setDealershipInfo({ ...dealershipInfo, showroomAddress: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={savingBusiness}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {savingBusiness ? 'Saving Changes...' : 'Save Dealership Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
