import React, { useState, useEffect } from 'react';
import {
  Car,
  Plus,
  Search,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  DollarSign,
  Fuel,
  Cog,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminVehicles,
  deleteAdminVehicle,
  toggleAdminVehiclePublish,
  toggleAdminVehicleAvailability,
} from '../../services/api';
import AdminVehicleModal from './AdminVehicleModal';

export default function AdminVehicles() {
  const { token } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'unpublished'

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Deletion confirm state
  const [deletingId, setDeletingId] = useState(null);

  const fetchVehicles = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await getAdminVehicles(token);
      setVehicles(res?.vehicles || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch dealership vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [token]);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setSelectedVehicle(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalOpen(true);
  };

  const handleTogglePublish = async (vehicle) => {
    try {
      const res = await toggleAdminVehiclePublish(token, vehicle.id);
      showToast(res.message);
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicle.id ? { ...v, is_published: res.is_published } : v))
      );
    } catch (err) {
      setError(err.message || 'Failed to toggle vehicle publish state.');
    }
  };

  const handleToggleAvailability = async (vehicle) => {
    try {
      const res = await toggleAdminVehicleAvailability(token, vehicle.id);
      showToast(res.message);
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicle.id ? { ...v, is_available: res.is_available } : v))
      );
    } catch (err) {
      setError(err.message || 'Failed to toggle vehicle availability.');
    }
  };

  const handleDeleteVehicle = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive "${name}"? Historical bookings referencing this car will be safely preserved.`)) {
      return;
    }
    try {
      setDeletingId(id);
      const res = await deleteAdminVehicle(token, id);
      showToast(res.message);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to archive vehicle.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        v.name?.toLowerCase().includes(q) ||
        v.brand?.toLowerCase().includes(q) ||
        v.model?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter === 'published' && !v.is_published) return false;
    if (statusFilter === 'unpublished' && v.is_published) return false;
    return true;
  });

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-1">
            <Car className="w-3.5 h-3.5" />
            <span>Shared Database Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Vehicle Fleet Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Add, update, or archive vehicles. Changes reflect immediately in the customer showroom and Browse Cars page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchVehicles}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors"
            title="Refresh inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5 shadow-lg">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by car name, make, or model..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({vehicles.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'published'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Published ({vehicles.filter((v) => v.is_published).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unpublished')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'unpublished'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Hidden ({vehicles.filter((v) => !v.is_published).length})
          </button>
        </div>
      </div>

      {/* Vehicles Table / Grid */}
      {loading && vehicles.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading fleet inventory from database...</p>
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Vehicle</th>
                  <th className="py-3.5 px-4">Specifications</th>
                  <th className="py-3.5 px-4">Price (USD)</th>
                  <th className="py-3.5 px-4">Showroom Status</th>
                  <th className="py-3.5 px-4">Booking Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-850/50 transition-colors">
                    {/* Vehicle Thumb & Info */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-11 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                          {v.image ? (
                            <img
                              src={v.image}
                              alt={v.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <Car className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{v.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {v.year} • {v.brand}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Specs */}
                    <td className="py-4 px-4">
                      <div className="text-[11px] text-slate-300 space-y-0.5">
                        <span className="block font-semibold">{v.fuel_type || v.fuelType} • {v.transmission}</span>
                        <span className="text-slate-500">{v.horsepower} • {v.mileage}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-amber-400">
                        ${parseFloat(v.price).toLocaleString()}
                      </span>
                    </td>

                    {/* Published Toggle */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(v)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-colors cursor-pointer ${
                          v.is_published
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                        }`}
                        title="Click to toggle customer showroom visibility"
                      >
                        {v.is_published ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Live in Showroom</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden (Draft)</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Available Toggle */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(v)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-colors cursor-pointer ${
                          v.is_available
                            ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                        title="Click to toggle booking availability"
                      >
                        {v.is_available ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Available</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-400" />
                            <span>Reserved / Sold</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(v)}
                          className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          title="Edit vehicle details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === v.id}
                          onClick={() => handleDeleteVehicle(v.id, v.name)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Archive / Remove vehicle"
                        >
                          {deletingId === v.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-amber-400 mx-auto flex items-center justify-center">
            <Car className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-white">No Matching Vehicles</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {searchQuery
              ? `No inventory matches your search "${searchQuery}".`
              : 'Your dealership inventory is currently empty.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle Now</span>
          </button>
        </div>
      )}

      {/* Vehicle Add / Edit Modal */}
      <AdminVehicleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        vehicle={selectedVehicle}
        onSuccess={() => {
          fetchVehicles();
          showToast(selectedVehicle ? 'Vehicle updated successfully!' : 'New vehicle published to showroom!');
        }}
      />
    </div>
  );
}
