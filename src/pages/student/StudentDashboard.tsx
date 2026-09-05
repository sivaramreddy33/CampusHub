import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import AttendanceWarning from '../../components/common/AttendanceWarning';
import Badge from '../../components/common/Badge';
import {
  CalendarCheck,
  FileText,
  Clock,
  CheckCircle2,
  MessageSquareWarning,
  Bell,
  ArrowUpRight,
  TrendingUp,
  Award,
  BookOpen
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

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/students/dashboard/')
      .then((res) => setData(res.data))
      .catch((err) => console.error('Failed to load student dashboard', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">Unable to load student metrics. Please try again.</p>
      </div>
    );
  }

  const student = data?.student || {};
  const overall_attendance = data?.overall_attendance ?? 0;
  const is_attendance_warning = Boolean(data?.is_attendance_warning);
  const attendance_by_subject = Array.isArray(data?.attendance_by_subject) ? data.attendance_by_subject : [];
  const total_assignments = data?.total_assignments ?? 0;
  const pending_assignments_count = data?.pending_assignments_count ?? 0;
  const submitted_assignments_count = data?.submitted_assignments_count ?? 0;
  const complaint_count = data?.complaint_count ?? 0;
  const assignment_stats = Array.isArray(data?.assignment_stats) ? data.assignment_stats : [];
  const recent_announcements = Array.isArray(data?.recent_announcements) ? data.recent_announcements : [];

  return (
    <div className="space-y-5">
      {/* High Density Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                Session 2026
              </span>
              <span className="text-xs text-slate-400 font-mono">Roll #{student.roll_number}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white">
              Welcome back, {student.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {student.department} • Year {student.year}, Section {student.section}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/student/attendance')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
            >
              Attendance Record
            </button>
            <button
              onClick={() => navigate('/student/assignments')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              My Assignments
            </button>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Attendance Warning if < 75% */}
      {is_attendance_warning && (
        <AttendanceWarning percentage={overall_attendance} />
      )}

      {/* Metric Cards - High Density */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Attendance Rate"
          value={`${overall_attendance}%`}
          subtitle={overall_attendance >= 75 ? 'Goal: 75% (Met)' : 'Below 75% threshold'}
          icon={CalendarCheck}
          color={overall_attendance >= 75 ? 'emerald' : 'amber'}
          onClick={() => navigate('/student/attendance')}
        />
        <StatCard
          title="Active Assignments"
          value={total_assignments}
          subtitle={`${submitted_assignments_count} Submitted`}
          icon={FileText}
          color="indigo"
          onClick={() => navigate('/student/assignments')}
        />
        <StatCard
          title="Pending Work"
          value={pending_assignments_count}
          subtitle={pending_assignments_count > 0 ? 'Requires attention' : 'All clear!'}
          icon={Clock}
          color={pending_assignments_count > 0 ? 'rose' : 'emerald'}
          onClick={() => navigate('/student/assignments')}
        />
        <StatCard
          title="My Grievances"
          value={complaint_count}
          subtitle="Support tickets"
          icon={MessageSquareWarning}
          color="purple"
          onClick={() => navigate('/student/complaints')}
        />
      </div>

      {/* Charts Row - High Density */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance by Subject Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Attendance by Subject (%)</h2>
              <p className="text-[11px] text-slate-500">Breakdown against 75% minimum university requirement</p>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {attendance_by_subject.length} Courses
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendance_by_subject} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject_code" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value}% (${item.payload.present_classes}/${item.payload.total_classes} classes)`,
                    item.payload.subject_name
                  ]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {attendance_by_subject.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.percentage >= 75 ? '#10B981' : '#F59E0B'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              <span>Compliant (≥ 75%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <span>Alert Threshold (&lt; 75%)</span>
            </div>
          </div>
        </div>

        {/* Assignment Status Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Assignment Breakdown</h2>
            <p className="text-[11px] text-slate-500">Submission & evaluation distribution</p>
          </div>

          <div className="h-48 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assignment_stats}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {assignment_stats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-[11px] font-medium text-slate-500">Completion Ratio:</span>
            <span className="text-xs font-bold text-slate-900">
              {total_assignments > 0
                ? `${Math.round((submitted_assignments_count / total_assignments) * 100)}%`
                : '100%'}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Announcements - High Density Styling */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Institutional Bulletins & Notices</h2>
          </div>
          <button
            onClick={() => navigate('/student/announcements')}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recent_announcements.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No announcements yet.</p>
          ) : (
            recent_announcements.map((ann: any, idx: number) => (
              <div
                key={ann.id}
                className={`p-3.5 rounded-r-lg border-l-2 transition-colors ${
                  idx === 0
                    ? 'bg-indigo-50/70 border-indigo-600'
                    : 'bg-slate-50 border-slate-300 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-xs font-bold text-slate-900">{ann.title}</h3>
                  <span className="text-[10px] font-medium text-slate-400 uppercase shrink-0">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{ann.content}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="font-semibold text-indigo-600">{ann.department_name}</span>
                  <span>•</span>
                  <span>By {ann.creator_name}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
