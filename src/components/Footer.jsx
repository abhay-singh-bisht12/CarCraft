import React from 'react';
import { Car, MapPin, Phone, Mail, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 border-t border-slate-800 text-slate-400">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Car className="w-5 h-5 text-slate-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white">
                  Car<span className="text-amber-400">Craft</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                  Dealership Suite
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              CarCraft is an advanced automotive inventory & dealership suite designed for modern car enthusiasts and luxury auto retailers. Offering certified high-performance vehicles and streamlined digital ownership.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Dealer Network & Certified Inspection</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Inventory
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/cars" className="hover:text-amber-400 transition-colors">
                  Browse All Cars
                </Link>
              </li>
              <li>
                <Link to="/cars" className="hover:text-amber-400 transition-colors">
                  Sports & Supercars
                </Link>
              </li>
              <li>
                <Link to="/cars" className="hover:text-amber-400 transition-colors">
                  Luxury Sedans
                </Link>
              </li>
              <li>
                <Link to="/cars" className="hover:text-amber-400 transition-colors">
                  Performance Coupés
                </Link>
              </li>
              <li>
                <Link to="/cars" className="hover:text-amber-400 transition-colors">
                  Certified Pre-Owned
                </Link>
              </li>
            </ul>
          </div>

          {/* Dealership Services */}
          <div className="space-y-4" id="services">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#services" className="hover:text-amber-400 transition-colors">
                  Financing & Leasing
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-amber-400 transition-colors">
                  Trade-In Valuation
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-amber-400 transition-colors">
                  Multi-Point Inspection
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-amber-400 transition-colors">
                  Vehicle Consignment
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-amber-400 transition-colors">
                  Doorstep Delivery
                </a>
              </li>
            </ul>
          </div>

          {/* Dealership Showroom Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Showroom
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span>100 Apex Boulevard, Auto District, Suite 500</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+1 (800) 555-CRAFT</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>contact@carcraftsuite.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span>Mon – Sat: 9:00 AM – 8:00 PM<br />Sun: By Appointment</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 bg-slate-950/90 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CarCraft — Automotive Inventory & Dealership Suite. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Inventory Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
