import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Car,
  ChevronRight,
  Filter,
  DollarSign,
  Fuel,
  Cog,
  CheckCircle2,
} from 'lucide-react';
import CarCard from '../components/CarCard';
import { sampleCars } from '../data/cars';
import { useAuth } from '../context/AuthContext';
import { getFavourites, getVehicles } from '../services/api';

export default function Cars() {
  const { isAuthenticated, token } = useAuth();
  const [cars, setCars] = useState(sampleCars);
  const [loadingCars, setLoadingCars] = useState(true);
  const [favouriteCarIds, setFavouriteCarIds] = useState([]);

  // Fetch live published vehicles from database
  useEffect(() => {
    let isMounted = true;
    async function loadVehicles() {
      try {
        setLoadingCars(true);
        const res = await getVehicles();
        if (isMounted && res?.vehicles && Array.isArray(res.vehicles) && res.vehicles.length > 0) {
          setCars(res.vehicles);
        }
      } catch (err) {
        console.warn('Could not load vehicles from database API, using local inventory:', err);
      } finally {
        if (isMounted) setLoadingCars(false);
      }
    }
    loadVehicles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch saved favourites for authenticated client
  useEffect(() => {
    let isMounted = true;
    async function loadFavourites() {
      if (!isAuthenticated || !token) {
        setFavouriteCarIds([]);
        return;
      }
      try {
        const res = await getFavourites(token);
        if (isMounted && res?.favourite_ids) {
          setFavouriteCarIds(res.favourite_ids);
        }
      } catch {
        // Silently ignore if offline
      }
    }
    loadFavourites();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token]);

  const handleToggleFav = (carId, isNowFav) => {
    setFavouriteCarIds((prev) =>
      isNowFav ? [...prev, carId] : prev.filter((id) => id !== carId)
    );
  };

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [fuelType, setFuelType] = useState('all');
  const [transmission, setTransmission] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Formatter for USD prices
  const formatCurrency = (val) => {
    if (!val || isNaN(val)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Derive filtered and sorted cars from database inventory
  const filteredCars = useMemo(() => {
    return cars
      .filter((car) => {
        // 1. Search Query: matches name, brand, or model
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesName = car.name ? car.name.toLowerCase().includes(query) : false;
          const matchesBrand = car.brand ? car.brand.toLowerCase().includes(query) : false;
          const matchesModel = car.model ? car.model.toLowerCase().includes(query) : false;
          if (!matchesName && !matchesBrand && !matchesModel) {
            return false;
          }
        }

        // 2. Minimum Price
        if (minPrice !== '' && !isNaN(Number(minPrice))) {
          if (Number(car.price) < Number(minPrice)) {
            return false;
          }
        }

        // 3. Maximum Price
        if (maxPrice !== '' && !isNaN(Number(maxPrice))) {
          if (Number(car.price) > Number(maxPrice)) {
            return false;
          }
        }

        // 4. Fuel Type
        if (fuelType !== 'all') {
          const carFuel = (car.fuelType || car.fuel_type || '').toLowerCase();
          if (carFuel !== fuelType.toLowerCase()) {
            return false;
          }
        }

        // 5. Transmission
        if (transmission !== 'all') {
          const carTrans = (car.transmission || '').toLowerCase();
          if (carTrans !== transmission.toLowerCase()) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          return Number(a.price) - Number(b.price);
        }
        if (sortBy === 'price-desc') {
          return Number(b.price) - Number(a.price);
        }
        // 'featured' sort: prioritize featured tags, then ID
        if (a.tag === 'Featured' && b.tag !== 'Featured') return -1;
        if (a.tag !== 'Featured' && b.tag === 'Featured') return 1;
        return Number(a.id) - Number(b.id);
      });
  }, [cars, searchQuery, minPrice, maxPrice, fuelType, transmission, sortBy]);

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      minPrice !== '' ||
      maxPrice !== '' ||
      fuelType !== 'all' ||
      transmission !== 'all' ||
      sortBy !== 'featured'
  );

  // Count active non-default filters for UI indicator
  const activeFilterCount = [
    searchQuery.trim() ? 1 : 0,
    minPrice !== '' ? 1 : 0,
    maxPrice !== '' ? 1 : 0,
    fuelType !== 'all' ? 1 : 0,
    transmission !== 'all' ? 1 : 0,
    sortBy !== 'featured' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Clear all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setFuelType('all');
    setTransmission('all');
    setSortBy('featured');
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-amber-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200 font-medium">Browse Inventory</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="relative overflow-hidden pt-10 pb-8 sm:pb-12 border-b border-slate-800/60 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-semibold text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Showroom Inventory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Browse Verified Vehicles
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                Filter by price bracket, fuel specification, and transmission. Each vehicle undergoes our exhaustive multi-point inspection.
              </p>
            </div>

            {/* Total matching count badge */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 shadow-inner">
                Showing{' '}
                <span className="text-amber-400 font-bold text-sm">
                  {filteredCars.length}
                </span>{' '}
                of {sampleCars.length} vehicles
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Filter & Inventory Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Filter Bar Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-10 shadow-xl shadow-black/40">
          
          {/* Top Row: Search & Mobile Filter Toggle */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-4 border-b border-slate-800/80">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by car name, brand, or model (e.g. Porsche, M4, GT63)..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-sm font-semibold border border-slate-700 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Filters & Sorting</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700"
                  title="Clear all filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Controls Row (Always visible on desktop, toggleable on mobile) */}
          <div
            className={`${
              mobileFiltersOpen ? 'block' : 'hidden'
            } md:block pt-5 space-y-5`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Min Price Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>Min Price {minPrice ? `(${formatCurrency(minPrice)})` : ''}</span>
                </label>
                <select
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                >
                  <option value="">No Minimum</option>
                  <option value="60000">$60,000</option>
                  <option value="80000">$80,000</option>
                  <option value="100000">$100,000</option>
                  <option value="120000">$120,000</option>
                  <option value="150000">$150,000</option>
                </select>
              </div>

              {/* Max Price Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>Max Price {maxPrice ? `(${formatCurrency(maxPrice)})` : ''}</span>
                </label>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                >
                  <option value="">No Maximum</option>
                  <option value="80000">$80,000</option>
                  <option value="100000">$100,000</option>
                  <option value="125000">$125,000</option>
                  <option value="150000">$150,000</option>
                  <option value="175000">$175,000</option>
                  <option value="200000">$200,000</option>
                </select>
              </div>

              {/* Fuel Type Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fuel Type</span>
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                >
                  <option value="all">All Fuel Types</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Transmission Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Cog className="w-3.5 h-3.5 text-amber-400" />
                  <span>Transmission</span>
                </label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                >
                  <option value="all">All Transmissions</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="Dual-Clutch">Dual-Clutch</option>
                </select>
              </div>

              {/* Sort By Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sort By</span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                >
                  <option value="featured">Featured / Spotlight</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

            </div>

            {/* Bottom Actions: Active Badges and Clear Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-slate-400">
                <span>Active Filters:</span>
                {!hasActiveFilters && (
                  <span className="text-slate-500 italic">None (Displaying all cars)</span>
                )}
                {searchQuery && (
                  <span className="px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20">
                    Query: "{searchQuery}"
                  </span>
                )}
                {minPrice && (
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                    Min: {formatCurrency(minPrice)}
                  </span>
                )}
                {maxPrice && (
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                    Max: {formatCurrency(maxPrice)}
                  </span>
                )}
                {fuelType !== 'all' && (
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                    Fuel: {fuelType}
                  </span>
                )}
                {transmission !== 'all' && (
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                    Gearbox: {transmission}
                  </span>
                )}
                {sortBy !== 'featured' && (
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                    Sort: {sortBy === 'price-asc' ? 'Low to High' : 'High to Low'}
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Cars Inventory Grid or Empty State */}
        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                isFavourite={favouriteCarIds.includes(car.id)}
                onToggleFavourite={handleToggleFav}
              />
            ))}
          </div>
        ) : (
          /* Empty State when no cars match criteria */
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-12 text-center max-w-xl mx-auto space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
              <Car className="w-8 h-8 text-amber-400 opacity-80" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                No matching vehicles found
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                We couldn't find any vehicles in our current inventory that match your specific filter criteria.
                Try adjusting your price range or clearing selected options.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20 transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
