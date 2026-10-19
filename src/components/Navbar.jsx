import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const isStaffOrAdmin = Boolean(user?.isStaff || user?.isSuperuser || user?.role === 'admin');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Branding */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <Car className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                Car<span className="text-amber-400">Craft</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                Automotive Suite
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-slate-200 hover:text-amber-400 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/cars"
              className="text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors"
            >
              Browse Cars
            </Link>
            <a
              href="/#featured"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Featured
            </a>
            <a
              href="/#services"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Services
            </a>
            <a
              href="/#contact"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Right Action & Auth Buttons */}
          <div className="hidden md:flex items-center gap-2.5 lg:gap-3.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {/* Logged in User Display - Clickable Profile Link */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-400/50 text-xs text-slate-200 transition-all duration-200 group"
                  title="View My Account & Profile"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-[11px] group-hover:scale-105 transition-transform">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className="font-semibold text-white max-w-[130px] truncate group-hover:text-amber-400 transition-colors"
                    title={user?.fullName || user?.email}
                  >
                    {user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Client'}
                  </span>
                </Link>

                {/* Admin Portal Shortcut for Staff */}
                {isStaffOrAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 text-xs font-bold transition-all shadow-sm shadow-amber-500/10"
                    title="Open Dealership Admin Dashboard"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Logout Action Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-900 px-3 py-1.5 rounded-xl border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                  title="Sign out of your account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors px-2 py-1.5"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-xl border border-amber-400/30 hover:border-amber-400/60 hover:bg-amber-400/5 transition-all"
                >
                  Register
                </Link>
              </>
            )}

            <Link
              to="/cars"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-200"
            >
              Browse Cars
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/cars"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-amber-400 hover:bg-slate-800"
          >
            Browse Cars
          </Link>
          <a
            href="/#featured"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Featured Cars
          </a>
          <a
            href="/#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Services
          </a>
          <a
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Contact
          </a>

          {/* Mobile Auth & CTA Buttons */}
          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/40 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight group-hover:text-amber-400 transition-colors">
                        {user?.fullName || 'Client'}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight truncate max-w-[180px]">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                    My Account
                  </span>
                </Link>

                {isStaffOrAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-400 font-bold text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Dealership Admin Panel</span>
                    </div>
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
                      STAFF
                    </span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await handleLogout();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-3 rounded-xl text-sm font-semibold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            <Link
              to="/cars"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center block px-4 py-3 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 shadow-md"
            >
              Browse Cars
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
