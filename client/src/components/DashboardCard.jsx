import React from 'react';

const DashboardCard = ({
  title,
  value,
  unit = 'mg/dl',
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'pink', // 'pink', 'lavender', 'teal', 'blue'
}) => {
  const colorMap = {
    pink: {
      bgIcon: 'bg-brand-50 text-brand-500',
      borderHover: 'hover:border-pink-200',
      accent: 'text-brand-500',
    },
    lavender: {
      bgIcon: 'bg-lavender-50 text-lavender-500',
      borderHover: 'hover:border-purple-200',
      accent: 'text-lavender-500',
    },
    teal: {
      bgIcon: 'bg-teal-50 text-teal-600',
      borderHover: 'hover:border-teal-200',
      accent: 'text-teal-600',
    },
    blue: {
      bgIcon: 'bg-blue-50 text-blue-600',
      borderHover: 'hover:border-blue-200',
      accent: 'text-blue-600',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.pink;

  return (
    <div
      className={`p-5 rounded-2xl bg-white border border-slate-100 shadow-soft transition-all duration-200 ${scheme.borderHover} hover:shadow-card`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${scheme.bgIcon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-1.5">
        <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
          {value !== null && value !== undefined ? value : '—'}
        </span>
        {value !== null && value !== undefined && unit && (
          <span className="text-xs font-semibold text-slate-400">{unit}</span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs font-medium text-slate-500 flex items-center space-x-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default DashboardCard;

