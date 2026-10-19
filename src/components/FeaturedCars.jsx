import React from 'react';
import { Link } from 'react-router-dom';
import CarCard from './CarCard';
import { sampleCars } from '../data/cars';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FeaturedCars() {
  const featuredCars = sampleCars.slice(0, 3);

  return (
    <section id="featured" className="py-20 lg:py-28 bg-slate-950 relative border-t border-slate-800/80">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Collection</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Featured Showroom Arrivals
            </h2>
            
            <p className="text-base text-slate-400 font-normal leading-relaxed">
              Explore our pristine selection of high-performance vehicles, inspected and certified by master automotive technicians.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-amber-400 hover:text-amber-300 bg-slate-900 border border-slate-800 hover:border-amber-400/30 transition-all duration-200 group"
            >
              <span>View Full Inventory</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 3-Column Responsive Car Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        {/* Bottom Banner / Reassurance */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-bold text-white">
              Can't find the exact specification you desire?
            </h4>
            <p className="text-sm text-slate-400">
              Our bespoke concierge team can source rare vehicles across global private networks and verified auctions.
            </p>
          </div>

          <button
            type="button"
            className="whitespace-nowrap px-6 py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 transition-colors shadow-lg"
          >
            Request Bespoke Search
          </button>
        </div>

      </div>
    </section>
  );
}
