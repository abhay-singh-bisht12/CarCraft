import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Award, Fuel } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 lg:py-28">
      {/* Decorative background glow elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Description & Action */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 shadow-sm text-xs font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Premium Dealership Suite & Inventory</span>
            </div>

            {/* Prominent heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Find Your Dream Ride With <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Unmatched Power</span> & Elegance.
            </h1>

            {/* Short description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              CarCraft curates the highest echelon of verified sports cars, luxury sedans, and performance SUVs. Experience transparent pricing, verified multi-point inspections, and effortless acquisition.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/cars"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200 group"
              >
                <span>Browse Cars</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#services"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all duration-200"
              >
                Dealership Services
              </a>
            </div>

            {/* Dealership trust stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
              <div className="text-left">
                <p className="text-2xl sm:text-3xl font-extrabold text-white">250+</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Vehicles in Stock</p>
              </div>
              <div className="text-left border-l border-slate-800 pl-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-white">99.8%</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Satisfaction Rate</p>
              </div>
              <div className="text-left border-l border-slate-800 pl-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-white">150-Pt</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Quality Inspection</p>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Feature Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main showcase card */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-900/90 border border-slate-800 shadow-2xl shadow-black/80 group">
                <div className="relative h-72 sm:h-80 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
                    alt="Featured Supercar"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Badge */}
                  <span className="absolute top-4 left-4 bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    Showroom Spotlight
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Porsche</span>
                      <h3 className="text-xl font-bold text-white">911 GT3 Touring</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Starting at</span>
                      <span className="text-xl font-black text-white">$182,900</span>
                    </div>
                  </div>

                  {/* Specs summary pills */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                    <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80">
                      <p className="text-[11px] text-slate-400">0 - 60 mph</p>
                      <p className="text-sm font-bold text-slate-200">3.2 sec</p>
                    </div>
                    <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80">
                      <p className="text-[11px] text-slate-400">Power</p>
                      <p className="text-sm font-bold text-slate-200">502 HP</p>
                    </div>
                    <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80">
                      <p className="text-[11px] text-slate-400">Top Speed</p>
                      <p className="text-sm font-bold text-slate-200">199 mph</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating verified badge */}
              <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-xl items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">CarCraft Certified</p>
                  <p className="text-[11px] text-slate-400">Factory warranty included</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
