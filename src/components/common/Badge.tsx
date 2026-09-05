import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const norm = status.toUpperCase();

  let colors = 'bg-slate-100 text-slate-700';

  if (['PRESENT', 'RESOLVED', 'GRADED', 'ACTIVE', 'SUBMITTED', 'VERIFIED'].includes(norm)) {
    colors = 'bg-emerald-100 text-emerald-700';
  } else if (['ABSENT', 'REJECTED', 'DUE', 'FAILED', 'HIGH'].includes(norm)) {
    colors = 'bg-rose-100 text-rose-700';
  } else if (['LATE', 'PENDING', 'WARNING', 'DUE SOON', 'MEDIUM'].includes(norm)) {
    colors = 'bg-amber-100 text-amber-700';
  } else if (['IN_PROGRESS', 'IN REVIEW', 'IN_REVIEW'].includes(norm)) {
    colors = 'bg-indigo-100 text-indigo-700';
  } else if (['LOW', 'INFO', 'ELECTIVE'].includes(norm)) {
    colors = 'bg-sky-100 text-sky-700';
  }

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${colors} ${className}`}
    >
      {formatText(norm)}
    </span>
  );
};

export default Badge;

