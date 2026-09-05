import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import {
  CalendarCheck,
  Check,
  X,
  AlertCircle,
  Save,
  CheckCircle2,
  Users,
  Calendar,
  Loader2
} from 'lucide-react';
import { Subject } from '../../types';

interface StudentAttendanceRow {
  student_id: number;
  name: string;
  roll_number: string;
  status: 'PRESENT' | 'ABSENT';
}

export const FacultyAttendance: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentAttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFacultySubjects();
  }, []);

  const fetchFacultySubjects = async () => {
    try {
      const res = await api.get('/subjects/');
      const subjectsList = Array.isArray(res.data) ? res.data : [];
      setSubjects(subjectsList);
      if (subjectsList.length > 0) {
        setSelectedSubjectId(String(subjectsList[0].id));
        fetchEnrolledStudents(subjectsList[0].id, selectedDate, subjectsList);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load subjects', err);
      setLoading(false);
    }
  };

  const fetchEnrolledStudents = async (subjectId: number, date: string, currentSubjects?: Subject[]) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const activeSubjects = currentSubjects && currentSubjects.length > 0 ? currentSubjects : subjects;
      // Fetch students and existing attendance for this subject/date
      const [studentsRes, attendanceRes] = await Promise.all([
        api.get('/students/'),
        api.get(`/attendance/?subject=${subjectId}&subject_id=${subjectId}&date=${date}`)
      ]);

      const sub = activeSubjects.find((s) => s.id === subjectId);
      const studentList = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      // Filter students by department
      const relevantStudents = sub?.department_id
        ? studentList.filter((s: any) => s.profile?.department_id === sub.department_id)
        : studentList;

      const existingRecords: any[] = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];

      const rows: StudentAttendanceRow[] = relevantStudents.map((s: any) => {
        const record = existingRecords.find((r) => r.student_id === s.id);
        return {
          student_id: s.id,
          name: `${s.first_name} ${s.last_name}`,
          roll_number: s.profile?.roll_number || 'N/A',
          status: record ? record.status : 'PRESENT' // default to present
        };
      });

      setStudents(rows);
    } catch (err) {
      console.error('Failed to load students for attendance', err);
      setError('Could not retrieve class roster.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (newSubjectId: string) => {
    setSelectedSubjectId(newSubjectId);
    fetchEnrolledStudents(Number(newSubjectId), selectedDate);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    if (selectedSubjectId) {
      fetchEnrolledStudents(Number(selectedSubjectId), newDate);
    }
  };

  const setStudentStatus = (studentId: number, status: 'PRESENT' | 'ABSENT') => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, status } : s))
    );
  };

  const setAllStatus = (status: 'PRESENT' | 'ABSENT') => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSaveAttendance = async () => {
    if (!selectedSubjectId || students.length === 0) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const records = students.map((s) => ({
        student_id: s.student_id,
        status: s.status
      }));

      const res = await api.post('/attendance/', {
        subject_id: Number(selectedSubjectId),
        date: selectedDate,
        records
      });

      setMessage(res.data.message || 'Attendance saved successfully.');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to record attendance.');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const absentCount = students.filter((s) => s.status === 'ABSENT').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Record Daily Attendance</h1>
          <p className="text-xs text-slate-500">
            Submit classroom presence and mark student absences for academic compliance
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || students.length === 0}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Roll...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Attendance Session</span>
            </>
          )}
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Control Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Course / Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name} (Sem {sub.semester})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Lecture Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Batch Selectors & Tally */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>Roster: <strong>{students.length}</strong></span>
            <span>•</span>
            <span className="text-emerald-700">Present: <strong>{presentCount}</strong></span>
            <span>•</span>
            <span className="text-rose-700">Absent: <strong>{absentCount}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAllStatus('PRESENT')}
              type="button"
              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
            >
              All Present
            </button>
            <button
              onClick={() => setAllStatus('ABSENT')}
              type="button"
              className="px-3 py-1.5 bg-rose-50 text-rose-800 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
            >
              All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Roster Roll Sheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Roll Number</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5 text-center">Status Selection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-xs text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    Loading class roster...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-xs text-slate-400">
                    No students currently enrolled in this department/course.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const isPresent = student.status === 'PRESENT';

                  return (
                    <tr key={student.student_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {student.roll_number}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setStudentStatus(student.student_id, 'PRESENT')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setStudentStatus(student.student_id, 'ABSENT')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              !isPresent
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
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

export default FacultyAttendance;
