import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import {
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
  CalendarCheck,
  MessageSquareWarning,
  FileCheck,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/admin/');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin metrics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">Failed to load institutional analytics.</p>
      </div>
    );
  }

  const complaintStats = Array.isArray(data.complaint_stats) ? data.complaint_stats : [];
  const studentsByDept = Array.isArray(data.students_by_department) ? data.students_by_department : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/20">
                Institutional Control Center
              </span>
              <span className="text-xs text-purple-200">Campus Administration</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mt-1">
              CampusHub Executive Dashboard
            </h1>
            <p className="text-sm text-purple-200 mt-0.5">
              Integrated real-time telemetry across academic departments, student rosters, and campus services
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/admin/students')}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Students</span>
            </button>
            <button
              onClick={() => navigate('/admin/faculty')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition-colors border border-white/10 flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Faculty</span>
            </button>
            <button
              onClick={() => navigate('/admin/complaints')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition-colors border border-white/10 flex items-center gap-1.5"
            >
              <MessageSquareWarning className="w-3.5 h-3.5" />
              <span>Grievances ({data.pending_complaints})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Students"
          value={data.total_students}
          subtitle="Active B.Tech students"
          icon={GraduationCap}
          color="blue"
          onClick={() => navigate('/admin/students')}
        />
        <StatCard
          title="Appointed Faculty"
          value={data.total_faculty}
          subtitle="Professors & instructors"
          icon={Briefcase}
          color="emerald"
          onClick={() => navigate('/admin/faculty')}
        />
        <StatCard
          title="Academic Units"
          value={data.total_departments}
          subtitle={`${data.total_subjects} active subjects`}
          icon={Building2}
          color="purple"
          onClick={() => navigate('/admin/departments')}
        />
        <StatCard
          title="Campus Attendance"
          value={`${data.average_attendance}%`}
          subtitle="Institute-wide attendance"
          icon={CalendarCheck}
          color={data.average_attendance >= 75 ? 'emerald' : 'amber'}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance by Department */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Attendance by Academic Department (%)</h2>
              <p className="text-xs text-slate-500">Aggregate student attendance benchmarks per branch</p>
            </div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
              Threshold: 75%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.attendance_by_department} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`${value}% Attendance`, 'Average']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="attendance" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints Breakdown Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Student Grievances</h2>
              <button
                onClick={() => navigate('/admin/complaints')}
                className="text-xs font-semibold text-purple-700 hover:underline"
              >
                Review
              </button>
            </div>
            <p className="text-xs text-slate-500">Ticket resolution lifecycle</p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complaintStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complaintStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Pending Action:</span>
            <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              {data.pending_complaints} unresolved tickets
            </span>
          </div>
        </div>
      </div>

      {/* Enrolled Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-900 mb-1">Academic Department Roster Tally</h2>
        <p className="text-xs text-slate-500 mb-4">Student and faculty staffing allocation by branch</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {studentsByDept.map((dept: any) => (
            <div
              key={dept.department}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                  {dept.department}
                </span>
                <span className="text-xs text-slate-500 font-medium">{dept.name}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-700 border-t border-slate-200/60 pt-2">
                <span>Students: <strong>{dept.students}</strong></span>
                <span>Faculty: <strong>{dept.faculty}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
