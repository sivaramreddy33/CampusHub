import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { Users, Search, Mail, Phone, Hash, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const FacultyStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students/');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to load student roster', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.profile?.roll_number && s.profile.roll_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Academic Directory</h1>
          <p className="text-xs text-slate-500">
            Enrolled student roster, contact profiles, and real-time attendance compliance
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, roll, or email..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 shadow-xs"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Roll Number</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Class</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5 text-center">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const rate = s.profile?.attendance_percentage ?? 85;
                  const isWarning = rate < 75;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {s.profile?.roll_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`}
                            alt={s.first_name}
                            className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-slate-50"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">
                              {s.first_name} {s.last_name}
                            </div>
                            <div className="text-xs text-slate-400">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{s.profile?.department_code}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        Year {s.profile?.year}, Sec {s.profile?.section}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-600">
                        {s.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-bold text-xs">
                          {isWarning ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>{rate}%</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{rate}%</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyStudents;
