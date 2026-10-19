import React, { useState } from 'react';
import { Gauge, Fuel, Cog, ShieldCheck, Heart, Calendar, MessageSquare, Check } from 'lucide-react';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { toggleFavourite } from '../services/api';
import BookingModal from './BookingModal';
import EnquiryModal from './EnquiryModal';

export default function CarCard({ car, isFavourite = false, onToggleFavourite }) {
  const { requireAuth, token } = useRequireAuth();

  const [isFav, setIsFav] = useState(isFavourite);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync internal state if prop updates
  React.useEffect(() => {
    setIsFav(isFavourite);
  }, [isFavourite]);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleFavouriteClick = (e) => {
    e.stopPropagation();
    requireAuth(async () => {
      try {
        const nextState = !isFav;
        setIsFav(nextState);
        const res = await toggleFavourite(token, { carId: car.id, carName: car.name });
        showToast(res.message);
        if (onToggleFavourite) {
          onToggleFavourite(car.id, res.is_favourite);
        }
      } catch {
        // Revert on error
        setIsFav((prev) => !prev);
      }
    }, {
      message: 'Please sign in to save vehicles to your CarCraft wishlist.',
      actionData: { action: 'favourite', carId: car.id },
    });
  };

  const handleBookClick = () => {
    requireAuth(() => {
      setBookingOpen(true);
    }, {
      message: 'Please sign in to schedule a VIP test drive or purchase consultation.',
      actionData: { action: 'book', carId: car.id },
    });
  };

  const handleInquireClick = () => {
    requireAuth(() => {
      setEnquiryOpen(true);
    }, {
      message: 'Please sign in to submit an inquiry to our dealership specialists.',
      actionData: { action: 'inquire', carId: car.id },
    });
  };

  // Check availability status from database model
  const isAvailable = car.is_available !== false && car.isAvailable !== false;

  // Format price with commas
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(car.price);

  return (
    <>
      <div className="group rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col relative">
        
        {/* Inline Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 left-3 right-3 z-30 p-2.5 rounded-xl bg-slate-950/95 border border-amber-400/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 shadow-xl animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Image Container with Badges & Favourite Toggle */}
        <div className="relative h-60 sm:h-64 overflow-hidden bg-slate-950">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          {/* Gradient shadow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

          {/* Status / Category Tag & Availability Badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              {car.tag}
            </span>
            {!isAvailable && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-rose-500/90 text-white shadow-lg border border-rose-400/30">
                Reserved / Unavailable
              </span>
            )}
          </div>

          {/* Top Right: Year & Heart Toggle Button */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-900/90 backdrop-blur-md text-white border border-slate-800">
              {car.year}
            </span>

            <button
              type="button"
              onClick={handleFavouriteClick}
              className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                isFav
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-md shadow-rose-500/10'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-900/90'
              }`}
              title={isFav ? 'Remove from wishlist' : 'Save vehicle to wishlist'}
              aria-label={isFav ? 'Remove from wishlist' : 'Save vehicle to wishlist'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
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

          {/* Customer Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {isAvailable ? (
              <button
                type="button"
                onClick={handleBookClick}
                className="inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/10 hover:shadow-amber-500/25 transition-all duration-200 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Drive</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold text-slate-500 bg-slate-800/80 border border-slate-700/60 cursor-not-allowed"
                title="This vehicle is currently reserved or unavailable for booking"
              >
                <Calendar className="w-4 h-4 opacity-40" />
                <span>Reserved</span>
              </button>
            )}
            
            <button
              type="button"
              onClick={handleInquireClick}
              className="inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700/80 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
              title="Submit dealership inquiry"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Inquire</span>
            </button>
          </div>
        </div>
      </div>

      {/* Booking and Enquiry Modals */}
      <BookingModal
        car={car}
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={() => showToast('Booking request received!')}
      />

      <EnquiryModal
        car={car}
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        onSuccess={() => showToast('Inquiry sent successfully!')}
      />
    </>
  );
}
