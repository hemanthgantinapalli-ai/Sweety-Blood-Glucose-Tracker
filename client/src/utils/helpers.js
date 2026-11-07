/**
 * Returns current date in YYYY-MM-DD format
 */
export const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date for friendly human reading
 */
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const today = getTodayString();
  if (dateStr === today) return 'Today';

  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Categorize glucose level according to standard medical guidelines
 */
export const getGlucoseStatus = (value, timeSlot = '') => {
  const val = Number(value);
  if (!val) return { label: 'Unknown', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

  const isFasting = timeSlot.toLowerCase().includes('fasting');

  if (val < 70) {
    return {
      label: 'Low',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    };
  }

  if (isFasting) {
    if (val <= 99) {
      return {
        label: 'Normal',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      };
    }
    if (val <= 125) {
      return {
        label: 'Elevated',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
      };
    }
    return {
      label: 'High',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
    };
  } else {
    // Post-meal target is typically < 140 mg/dl
    if (val < 140) {
      return {
        label: 'Normal',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      };
    }
    if (val < 200) {
      return {
        label: 'Elevated',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
      };
    }
    return {
      label: 'High',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
    };
  }
};

/**
 * Validate reading form inputs on client
 */
export const validateReadingForm = ({ reading_date, time_slot, glucose_value }) => {
  const errors = {};
  const today = getTodayString();

  if (!reading_date) {
    errors.reading_date = 'Reading date is required.';
  } else if (reading_date > today) {
    // Rule 5: Future dates not allowed
    errors.reading_date = 'Date cannot be in the future.';
  }

  if (!time_slot) {
    errors.time_slot = 'Please select a time slot.';
  }

  // Rule 1: Value is required
  if (glucose_value === undefined || glucose_value === null || String(glucose_value).trim() === '') {
    errors.glucose_value = 'Please enter a glucose value.';
  } else {
    // Rule 2: Whole number between 40 and 600
    const num = Number(glucose_value);
    if (!Number.isInteger(num) || num < 40 || num > 600) {
      errors.glucose_value = 'Value must be between 40 and 600 mg/dl.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const TIME_SLOTS = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

