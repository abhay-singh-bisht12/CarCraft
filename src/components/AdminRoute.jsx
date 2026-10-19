import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
          Verifying Dealership Staff Credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: 'Please sign in with your dealership administrator account to access the Admin Portal.',
        }}
      />
    );
  }

  const isStaffOrAdmin = Boolean(user?.isStaff || user?.isSuperuser || user?.role === 'admin');

  if (!isStaffOrAdmin) {
    return (
      <div className="min-h-[70vh] bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl shadow-rose-950/20">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">Dealership Staff Only</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your account (<strong className="text-slate-200">{user?.email}</strong>) does not have staff or owner privileges. Contact the dealership owner or run <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">createsuperuser</code> to manage this portal.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Showroom</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
