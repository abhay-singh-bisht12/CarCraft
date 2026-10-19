import React from 'react';
import { Gauge, Fuel, Cog, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function CarCard({ car }) {
  // Format price with commas
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(car.price);

  return (
    <div className="group rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col">
      {/* Image Container with Badges */}
      <div className="relative h-60 sm:h-64 overflow-hidden bg-slate-950">
        <img
          src={car.image}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20" />

        {/* Status / Category Tag */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            {car.tag}
          </span>
        </div>

        {/* Year Pill */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-900/90 backdrop-blur-md text-white border border-slate-800">
            {car.year}
          </span>
        </div>

        {/* Price overlay at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase block">
              Dealership Price
            </span>
            <span className="text-2xl font-black text-white tracking-tight drop-shadow-md">
              {formattedPrice}
            </span>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
            {car.horsepower}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              {car.brand}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {car.drivetrain}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
            {car.name}
          </h3>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {car.description}
          </p>
        </div>

        {/* Key Specification Badges */}
        <div className="grid grid-cols-3 gap-2.5 py-3 border-y border-slate-800/80 text-slate-300">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
            <Gauge className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[11px] font-semibold text-slate-200">{car.mileage}</span>
            <span className="text-[10px] text-slate-500">Mileage</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
            <Fuel className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[11px] font-semibold text-slate-200 truncate w-full">{car.fuelType}</span>
            <span className="text-[10px] text-slate-500">Fuel</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
            <Cog className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[11px] font-semibold text-slate-200 truncate w-full">{car.transmission}</span>
            <span className="text-[10px] text-slate-500">Gearbox</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/10 hover:shadow-amber-500/25 transition-all duration-200"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            className="px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700/80 hover:text-white transition-colors"
            title="Inquire about this vehicle"
          >
            Inquire
          </button>
        </div>
      </div>
    </div>
  );
}
