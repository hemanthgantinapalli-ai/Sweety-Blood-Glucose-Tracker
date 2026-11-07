import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  History as HistoryIcon,
  Filter,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  PlusCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { readingService } from '../services/readingService';
import { formatDisplayDate, TIME_SLOTS } from '../utils/helpers';
import GlucoseBadge from '../components/GlucoseBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const History = () => {
  const { openAddModal, openEditModal, refreshTrigger } = useOutletContext();

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterSlot, setFilterSlot] = useState('');

  // Deletion modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReadings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterSlot) params.time_slot = filterSlot;

      const res = await readingService.getReadings(params);
      if (res.success) {
        setReadings(res.readings || []);
      }
    } catch (err) {
      console.error('Failed to fetch readings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [filterDate, filterSlot, refreshTrigger]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await readingService.deleteReading(deleteTargetId);
      setDeleteTargetId(null);
      fetchReadings();
    } catch (err) {
      console.error('Failed to delete reading:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterDate('');
    setFilterSlot('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-2.5">
            <HistoryIcon className="w-6 h-6 text-pink-500" />
            <span>Reading History</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, filter, edit, and manage all your historical blood glucose logs
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="self-start md:self-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold text-sm shadow-md shadow-pink-500/25 transition-all active:scale-[0.98] flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Reading</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400/30"
            />
          </div>

          {/* Time Slot Filter */}
          <select
            value={filterSlot}
            onChange={(e) => setFilterSlot(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400/30"
          >
            <option value="">All Time Slots</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>

          {(filterDate || filterSlot) && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-pink-600 hover:text-pink-700 hover:underline px-2 py-1"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-400">
          Total: <span className="text-slate-700 font-bold">{readings.length}</span> records
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Loading your readings..." />
      ) : readings.length === 0 ? (
        <EmptyState
          title="No readings match your criteria"
          description={
            filterDate || filterSlot
              ? 'Try clearing your filters to see older recordings.'
              : 'You have not added any blood glucose readings yet.'
          }
          actionLabel={filterDate || filterSlot ? 'Reset Filters' : 'Add Reading'}
          onAction={filterDate || filterSlot ? clearFilters : openAddModal}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Time Slot</th>
                  <th className="py-4 px-6">Glucose Level</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {readings.map((reading) => (
                  <tr
                    key={reading.id}
                    className="hover:bg-pink-50/20 transition-colors group"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-800 whitespace-nowrap">
                      {formatDisplayDate(reading.reading_date)}
                      <span className="block text-[11px] font-normal text-slate-400">
                        {reading.reading_date}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium whitespace-nowrap">
                      {reading.time_slot}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-800 whitespace-nowrap">
                      <span className="text-base">{reading.glucose_value}</span>{' '}
                      <span className="text-xs font-semibold text-slate-400">mg/dl</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <GlucoseBadge
                        value={reading.glucose_value}
                        timeSlot={reading.time_slot}
                      />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(reading)}
                          className="p-2 rounded-xl text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                          title="Edit reading"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(reading.id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete reading"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Glucose Reading"
        message="Are you sure you want to permanently delete this reading entry? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Keep Reading"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default History;

