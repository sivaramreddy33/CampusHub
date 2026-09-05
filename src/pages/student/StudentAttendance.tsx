import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AttendanceWarning from '../../components/common/AttendanceWarning';
import Badge from '../../components/common/Badge';
import { CalendarCheck, AlertCircle, CheckCircle2, Clock, Filter, ArrowUpDown } from 'lucide-react';
import { StudentAttendanceSummary, AttendanceRecord } from '../../types';

export const StudentAttendance: React.FC = () => {
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null);
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, logsRes] = await Promise.all([
        api.get('/attendance/student/'),
        api.get('/attendance/')
      ]);
      setSummary(sumRes.data);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch (err) {
      console.error('Failed to load attendance records', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const subjectsList = Array.isArray(summary?.subjects) ? summary.subjects : [];

  const filteredLogs = (Array.isArray(logs) ? logs : []).filter((log) => {
    if (selectedSubject === 'all') return true;
    return log.subject_id === Number(selectedSubject);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance Record</h1>
          <p className="text-xs text-slate-500">Live track of classroom presence & attendance compliance</p>
        </div>

        {summary && (
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Cumulative Rate</div>
              <div className="text-lg font-extrabold text-slate-900 leading-none">
                {summary.overall_percentage}%
              </div>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                summary.overall_percentage >= 75
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {summary.total_attended}/{summary.total_conducted}
            </div>
          </div>
        )}
      </div>

      {/* Warning Notice if < 75% */}
      {summary && summary.is_warning && (
        <AttendanceWarning percentage={summary.overall_percentage} />
      )}

      {/* Subject-Wise Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Course Attendance Overview</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required: 75%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4 text-center">Attended / Total</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {subjectsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                    No course attendance records found.
                  </td>
                </tr>
              ) : (
                subjectsList.map((sub) => (
                  <tr key={sub.subject_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">{sub.subject_code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{sub.subject_name}</td>
                    <td className="py-3 px-4 text-center font-medium">
                      <span className="text-emerald-700 font-bold">{sub.present_classes}</span> / {sub.total_classes}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-36">
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                          <span className={sub.attendance_percentage >= 75 ? 'text-emerald-700' : 'text-amber-700'}>
                            {sub.attendance_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              sub.attendance_percentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, sub.attendance_percentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {sub.is_warning ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                          ATTENTION (&lt;75%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          COMPLIANT
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Date-wise Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Session Attendance Log</h2>
            <p className="text-[11px] text-slate-500">Chronological history of recorded lecture attendances</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-medium px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Enrolled Courses</option>
              {subjectsList.map((sub) => (
                <option key={sub.subject_id} value={sub.subject_id}>
                  {sub.subject_code} - {sub.subject_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Course</th>
                <th className="py-2.5 px-4">Recorded Status</th>
                <th className="py-2.5 px-4">Verified By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                    No session logs found for selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-700">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {item.subject_code} <span className="font-normal text-slate-400 text-xs">({item.subject_name})</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge status={item.status} />
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{item.marked_by_name || 'Faculty Staff'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
