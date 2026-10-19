import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle, CheckCircle2, Car, Image, DollarSign, Gauge, Fuel, Cog } from 'lucide-react';
import { createAdminVehicle, updateAdminVehicle } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminVehicleModal({ isOpen, onClose, vehicle, onSuccess }) {
  const { token } = useAuth();
  const isEditing = Boolean(vehicle);

  const initialForm = {
    name: '',
    brand: '',
    model: '',
    year: 2024,
    price: '',
    mileage: '1,000 mi',
    fuel_type: 'Gasoline',
    transmission: 'Automatic',
    drivetrain: 'AWD',
    horsepower: '450 HP',
    engine: '',
    tag: 'Featured',
    image: '',
    description: '',
    is_published: true,
    is_available: true,
  };

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || 2024,
        price: vehicle.price || '',
        mileage: vehicle.mileage || '',
        fuel_type: vehicle.fuel_type || vehicle.fuelType || 'Gasoline',
        transmission: vehicle.transmission || 'Automatic',
        drivetrain: vehicle.drivetrain || 'AWD',
        horsepower: vehicle.horsepower || '',
        engine: vehicle.engine || '',
        tag: vehicle.tag || 'Featured',
        image: vehicle.image || '',
        description: vehicle.description || '',
        is_published: vehicle.is_published ?? true,
        is_available: vehicle.is_available ?? true,
      });
    } else {
      setFormData(initialForm);
    }
    setStatusMessage(null);
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (statusMessage) setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.name.trim() || !formData.brand.trim() || !formData.price) {
      setStatusMessage({ type: 'error', text: 'Please complete all required fields (Name, Brand, Price).' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      year: parseInt(formData.year, 10),
    };

    try {
      if (isEditing) {
        await updateAdminVehicle(token, vehicle.id, payload);
      } else {
        await createAdminVehicle(token, payload);
      }

      setStatusMessage({
        type: 'success',
        text: `Vehicle "${formData.name}" successfully ${isEditing ? 'updated' : 'added to inventory'}!`,
      });

      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 1000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save vehicle details.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8 mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Car className="w-3.5 h-3.5" />
            <span>Showroom Inventory Management</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {isEditing ? `Edit Vehicle: ${vehicle.name}` : 'Add New Vehicle to Showroom'}
          </h3>
          <p className="text-xs text-slate-400">
            All updates immediately sync with the live customer catalog and search filters.
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mb-5 p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="font-medium leading-relaxed">{statusMessage.text}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Row 1: Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Vehicle Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Porsche 911 Carrera GTS"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Brand / Make *
              </label>
              <input
                type="text"
                name="brand"
                required
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Porsche, BMW, Mercedes-Benz"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Row 2: Model, Year, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., 911 Carrera GTS"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Model Year *
              </label>
              <input
                type="number"
                name="year"
                required
                min={1990}
                max={2030}
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Price (USD $) *
              </label>
              <input
                type="number"
                name="price"
                required
                min={0}
                step="any"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 149800"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Row 3: Specifications (Fuel, Transmission, Drivetrain) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Fuel Type
              </label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Gasoline">Gasoline</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Diesel">Diesel</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Transmission
              </label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="Dual-Clutch">Dual-Clutch</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Drivetrain
              </label>
              <select
                name="drivetrain"
                value={formData.drivetrain}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="AWD">AWD</option>
                <option value="RWD">RWD</option>
                <option value="FWD">FWD</option>
              </select>
            </div>
          </div>

          {/* Row 4: Horsepower, Mileage, Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Horsepower
              </label>
              <input
                type="text"
                name="horsepower"
                value={formData.horsepower}
                onChange={handleChange}
                placeholder="e.g., 503 HP"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Mileage
              </label>
              <input
                type="text"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="e.g., 2,400 mi"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Showroom Badge / Tag
              </label>
              <select
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Featured">Featured</option>
                <option value="New Arrival">New Arrival</option>
                <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                <option value="Special Order">Special Order</option>
              </select>
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-amber-400" />
              <span>Image URL</span>
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              Vehicle Description
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Bespoke highlights, engine specifications, interior package..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Visibility & Availability Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
              />
              <div>
                <span className="text-xs font-bold text-white block">Published to Showroom</span>
                <span className="text-[10px] text-slate-400">Visible to customer browsing & search</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
              />
              <div>
                <span className="text-xs font-bold text-white block">Available for Booking</span>
                <span className="text-[10px] text-slate-400">Clients can schedule test drives</span>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Saving Vehicle...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Publish Vehicle'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
