import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface AttendanceWarningProps {
  percentage: number;
  subjectName?: string;
}

export const AttendanceWarning: React.FC<AttendanceWarningProps> = ({ percentage, subjectName }) => {
  if (percentage >= 75) return null;

  return (
    <div className="bg-amber-50/90 border border-amber-200 border-l-4 border-l-amber-500 rounded-r-xl p-4 flex items-start gap-3 text-amber-900 shadow-xs">
      <div className="p-1 bg-amber-100 rounded-md text-amber-700 shrink-0 mt-0.5">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
            Attendance Advisory Alert: {percentage}%
          </h4>
          <span className="text-[10px] font-bold bg-amber-200/80 text-amber-800 px-1.5 py-0.5 rounded">
            Req: 75%
          </span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          {subjectName
            ? `Recorded attendance in ${subjectName} is ${percentage}%. Maintain at least 75% attendance to qualify for semester examinations.`
            : `Cumulative attendance is currently ${percentage}%. University guidelines mandate at least 75% attendance for exam eligibility.`}
        </p>
        <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-amber-700 font-medium">
          <Info className="w-3 h-3" />
          <span>Consult your course faculty regarding makeup classes or remedial sessions.</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceWarning;
