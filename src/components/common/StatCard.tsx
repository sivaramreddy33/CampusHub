import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'purple';
  progress?: number;
  onClick?: () => void;
}

const colorStyles = {
  blue: {
    text: 'text-indigo-600',
    bar: 'bg-indigo-500',
    iconBg: 'text-indigo-500 bg-indigo-50'
  },
  emerald: {
    text: 'text-emerald-600',
    bar: 'bg-emerald-500',
    iconBg: 'text-emerald-500 bg-emerald-50'
  },
  amber: {
    text: 'text-amber-600',
    bar: 'bg-amber-500',
    iconBg: 'text-amber-500 bg-amber-50'
  },
  indigo: {
    text: 'text-indigo-600',
    bar: 'bg-indigo-500',
    iconBg: 'text-indigo-500 bg-indigo-50'
  },
  rose: {
    text: 'text-rose-600',
    bar: 'bg-rose-500',
    iconBg: 'text-rose-500 bg-rose-50'
  },
  purple: {
    text: 'text-purple-600',
    bar: 'bg-purple-500',
    iconBg: 'text-purple-500 bg-purple-50'
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  progress,
  onClick
}) => {
  const c = colorStyles[color] || colorStyles.indigo;

  // Extract percentage if value is like "88.4%" or "75%"
  let calcProgress = progress;
  if (calcProgress === undefined && typeof value === 'string' && value.includes('%')) {
    const num = parseFloat(value.replace('%', ''));
    if (!isNaN(num)) calcProgress = Math.min(Math.max(num, 0), 100);
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:border-slate-300 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
          {title}
        </p>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.iconBg} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <h2 className={`text-2xl font-black ${c.text} tracking-tight`}>
          {value}
        </h2>
        {subtitle && (
          <span className="text-[10px] text-slate-400 font-medium">
            {subtitle}
          </span>
        )}
      </div>

      {calcProgress !== undefined ? (
        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
          <div className={`h-full ${c.bar}`} style={{ width: `${calcProgress}%` }}></div>
        </div>
      ) : (
        <div className="w-full h-1.5 bg-slate-50 rounded-full mt-3"></div>
      )}
    </div>
  );
};

export default StatCard;

