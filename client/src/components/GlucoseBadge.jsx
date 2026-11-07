import React from 'react';
import { getGlucoseStatus } from '../utils/helpers';

const GlucoseBadge = ({ value, timeSlot = '' }) => {
  const status = getGlucoseStatus(value, timeSlot);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text} ${status.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {value} mg/dl • {status.label}
    </span>
  );
};

export default GlucoseBadge;
