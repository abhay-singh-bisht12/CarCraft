import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
