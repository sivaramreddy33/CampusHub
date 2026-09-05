import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  CheckSquare,
  FileText,
  Clock,
  User,
  Hash,
  Search,
  Filter,
  Check,
  Edit,
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Submission, Assignment } from '../../types';

export const FacultySubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Grade Modal state
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [marks, setMarks] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [savingGrade, setSavingGrade] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [subsRes, assignsRes] = await Promise.all([
        api.get('/submissions/'),
        api.get('/assignments/')
      ]);
      setSubmissions(subsRes.data);
      setAssignments(assignsRes.data);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const openGradeModal = (sub: Submission) => {
    setGradingSubmission(sub);
    setMarks(sub.marks !== null && sub.marks !== undefined ? String(sub.marks) : '85');
    setFeedback(sub.feedback || '');
    setGradeError(null);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    const numMarks = Number(marks);
    if (isNaN(numMarks) || numMarks < 0 || numMarks > 100) {
      setGradeError('Marks must be a number between 0 and 100.');
      return;
    }

    setSavingGrade(true);
    setGradeError(null);

    try {
      const res = await api.put(`/submissions/${gradingSubmission.id}/grade/`, {
        marks: numMarks,
        feedback: feedback.trim()
      });

      // Update state locally
      setSubmissions((prev) =>
        prev.map((s) => (s.id === gradingSubmission.id ? res.data : s))
      );
      setGradingSubmission(null);
    } catch (err: any) {
      setGradeError(err.response?.data?.detail || 'Failed to submit grade.');
    } finally {
      setSavingGrade(false);
    }
  };

  const filtered = submissions.filter((sub) => {
    if (selectedAssignmentId !== 'all' && sub.assignment_id !== Number(selectedAssignmentId)) {
      return false;
    }
    const matchesSearch =
      (sub.student_name && sub.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.roll_number && sub.roll_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.assignment_title && sub.assignment_title.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Submissions & Evaluation</h1>
          <p className="text-xs text-slate-500">
            Review lab reports, assess code submissions, and release grades with qualitative feedback
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student or roll number..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Assignments</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.subject_code}: {a.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Assignment</th>
                <th className="px-6 py-3.5">Submitted On</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-center">Score</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400">
                    No submissions found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{sub.student_name}</div>
                      <div className="font-mono text-xs text-slate-400">{sub.roll_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 line-clamp-1">{sub.assignment_title}</div>
                      <div className="text-xs text-slate-400">{sub.subject_name}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(sub.submitted_at).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge status={sub.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {sub.marks !== null && sub.marks !== undefined ? (
                        <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          {sub.marks}/100
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not graded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openGradeModal(sub)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{sub.status === 'GRADED' ? 'Edit Grade' : 'Grade Work'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Modal */}
      {gradingSubmission && (
        <Modal
          isOpen={true}
          onClose={() => setGradingSubmission(null)}
          title={`Evaluate Submission: ${gradingSubmission.student_name}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveGrade} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{gradingSubmission.assignment_title}</span>
                <Badge status={gradingSubmission.status} />
              </div>
              <div>
                <span className="text-slate-400">Student: </span>
                <strong className="text-slate-900">{gradingSubmission.student_name}</strong> ({gradingSubmission.roll_number})
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 block mb-1">Student Deliverable Notes / Solution:</span>
                <p className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap font-mono text-[11px]">
                  {gradingSubmission.submission_text}
                </p>
                {gradingSubmission.submission_file && (
                  <div className="mt-2 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Attached Document: {gradingSubmission.submission_file}</span>
                  </div>
                )}
              </div>
            </div>

            {gradeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{gradeError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Marks Awarded (out of 100) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Faculty Remarks & Qualitative Feedback
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g. Excellent timing analysis and edge-case handling. Clean documentation."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingGrade}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                {savingGrade ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Grade...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default FacultySubmissions;
