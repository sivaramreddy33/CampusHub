import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import {
  BookOpen,
  Users,
  CheckSquare,
  FileText,
  CalendarCheck,
  Plus,
  ArrowUpRight,
  TrendingUp
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

export const FacultyDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/faculty/dashboard/')
      .then((res) => setData(res.data))
      .catch((err) => console.error('Failed to load faculty dashboard', err))
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
        <p className="text-slate-500">Unable to load faculty dashboard metrics.</p>
      </div>
    );
  }

  const faculty = data?.faculty || {};
  const total_assigned_subjects = data?.total_assigned_subjects ?? data?.total_subjects ?? 0;
  const total_students_taught = data?.total_students_taught ?? data?.total_students ?? 0;
  const pending_evaluations_count = data?.pending_evaluations_count ?? data?.pending_submissions ?? 0;
  const total_assignments_created = data?.total_assignments_created ?? data?.active_assignments ?? 0;
  const subjects = Array.isArray(data?.subjects) ? data.subjects : (Array.isArray(data?.assigned_subjects) ? data.assigned_subjects : []);
  const subject_attendance_stats = Array.isArray(data?.subject_attendance_stats) ? data.subject_attendance_stats : [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/20">
                {faculty.designation}
              </span>
              <span className="text-xs text-emerald-200">ID: {faculty.employee_id}</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mt-1">
              Welcome, Prof. {faculty.name}
            </h1>
            <p className="text-sm text-emerald-200 mt-0.5">
              Department of {faculty.department}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/faculty/attendance')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
            <button
              onClick={() => navigate('/faculty/assignments')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition-colors border border-white/10"
            >
              Create Assignment
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Courses"
          value={total_assigned_subjects}
          subtitle="Curriculum subjects"
          icon={BookOpen}
          color="emerald"
          onClick={() => navigate('/faculty/students')}
        />
        <StatCard
          title="Students Enrolled"
          value={total_students_taught}
          subtitle="Under instruction"
          icon={Users}
          color="blue"
          onClick={() => navigate('/faculty/students')}
        />
        <StatCard
          title="Pending Evaluations"
          value={pending_evaluations_count}
          subtitle={pending_evaluations_count > 0 ? 'Awaiting grading' : 'All caught up!'}
          icon={CheckSquare}
          color={pending_evaluations_count > 0 ? 'amber' : 'emerald'}
          onClick={() => navigate('/faculty/submissions')}
        />
        <StatCard
          title="Assignments Created"
          value={total_assignments_created}
          subtitle="Total coursework"
          icon={FileText}
          color="indigo"
          onClick={() => navigate('/faculty/assignments')}
        />
      </div>

      {/* Charts & Subject Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Rate per Subject */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Course Attendance Averages</h2>
              <p className="text-xs text-slate-500">Student attendance statistics across your assigned courses</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subject_attendance_stats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value}% (${item.payload.records_count || item.payload.total_classes || 0} student marks recorded)`,
                    item.payload.subject || item.payload.subject_name
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="average_attendance" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Courses Handled List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Your Courses</h2>
            <p className="text-xs text-slate-500 mb-4">Semester course registrations</p>

            <div className="space-y-3">
              {subjects.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No courses assigned yet.
                </div>
              ) : (
                subjects.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {sub.code || sub.subject_code}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">Sem {sub.semester}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900">{sub.name || sub.subject_name}</div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Enrolled: {sub.student_count ?? 0} students</span>
                      <button
                        onClick={() => navigate('/faculty/attendance')}
                        className="text-emerald-700 font-bold hover:underline"
                      >
                        Take Roll
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => navigate('/faculty/submissions')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <span>Review Student Submissions</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
