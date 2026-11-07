import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { getTodayString, validateReadingForm, TIME_SLOTS } from '../utils/helpers';
import { readingService } from '../services/readingService';

const ReadingModal = ({
  isOpen,
  onClose,
  onSuccess,
  readingToEdit = null, // if provided, modal operates in Edit mode
}) => {
  const today = getTodayString();

  const [formData, setFormData] = useState({
    reading_date: today,
    time_slot: 'Morning (fasting)',
    glucose_value: '',
  });

  const [clientErrors, setClientErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when opening or changing readingToEdit
  useEffect(() => {
    if (readingToEdit) {
      setFormData({
        reading_date: readingToEdit.reading_date,
        time_slot: readingToEdit.time_slot,
        glucose_value: String(readingToEdit.glucose_value),
      });
    } else {
      setFormData({
        reading_date: today,
        time_slot: 'Morning (fasting)',
        glucose_value: '',
      });
    }
    setClientErrors({});
    setServerError('');
  }, [readingToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error on change
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Frontend validation
    const { isValid, errors } = validateReadingForm(formData);
    if (!isValid) {
      setClientErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        reading_date: formData.reading_date,
        time_slot: formData.time_slot,
        glucose_value: parseInt(formData.glucose_value, 10),
      };

      if (readingToEdit) {
        await readingService.updateReading(readingToEdit.id, payload);
      } else {
        await readingService.createReading(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save glucose reading. Please try again.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-pink-50/50 to-purple-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {readingToEdit ? 'Edit Glucose Reading' : 'Log Blood Glucose'}
              </h2>
              <p className="text-xs text-slate-500">
                {readingToEdit ? 'Update your recorded entry' : 'Record a new measurement for your health log'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {serverError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="font-medium">{serverError}</div>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-pink-500" />
              <span>Reading Date</span>
            </label>
            <input
              type="date"
              name="reading_date"
              max={today}
              value={formData.reading_date}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400/30 transition-all ${
                clientErrors.reading_date ? 'border-rose-300 ring-rose-200' : 'border-slate-200'
              }`}
            />
            {clientErrors.reading_date && (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">
                {clientErrors.reading_date}
              </p>
            )}
          </div>

          {/* Time Slot Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>Time Slot</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {TIME_SLOTS.map((slot) => {
                const isSelected = formData.time_slot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, time_slot: slot }));
                      setServerError('');
                    }}
                    className={`px-3 py-2.5 text-xs font-semibold rounded-xl text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50/70 text-pink-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span>{slot}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-pink-500" />}
                  </button>
                );
              })}
            </div>
            {clientErrors.time_slot && (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">
                {clientErrors.time_slot}
              </p>
            )}
          </div>

          {/* Glucose Value Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-pink-500" />
              <span>Glucose Level (mg/dl)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="glucose_value"
                placeholder="e.g. 105"
                min="40"
                max="600"
                step="1"
                value={formData.glucose_value}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400/30 transition-all ${
                  clientErrors.glucose_value ? 'border-rose-300 ring-rose-200' : 'border-slate-200'
                }`}
              />
              <span className="absolute right-4 top-2.5 text-xs font-bold text-slate-400">
                mg/dl
              </span>
            </div>
            {clientErrors.glucose_value && (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">
                {clientErrors.glucose_value}
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-400">
              Valid range: 40 to 600 mg/dl (whole number)
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl shadow-md shadow-pink-500/25 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{readingToEdit ? 'Update Reading' : 'Save Reading'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReadingModal;

