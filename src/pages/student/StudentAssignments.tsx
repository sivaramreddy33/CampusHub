import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Calendar,
  User,
  Search,
  Check,
  Send,
  Loader2
} from 'lucide-react';
import { Assignment } from '../../types';

export const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED'>('ALL');

  // Submit Modal
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // View Grade Modal
  const [viewGradeAssignment, setViewGradeAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments/');
      setAssignments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load assignments', err);
    } finally {
      setLoading(false);
    }
  };

  const openSubmitModal = (assign: Assignment) => {
    setSelectedAssignment(assign);
    if (assign.student_submission) {
      setSubmissionText(assign.student_submission.submission_text || '');
      setSubmissionFileName(assign.student_submission.submission_file || '');
    } else {
      setSubmissionText('');
      setSubmissionFileName('');
    }
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFileName(e.target.files[0].name);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    if (!submissionText.trim()) {
      setSubmitError('Please provide a submission description or code link/notes.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await api.post('/submissions/', {
        assignment_id: selectedAssignment.id,
        submission_text: submissionText,
        submission_file: submissionFileName || 'lab_report_sivarami.pdf'
      });
      setSubmitSuccess(res.data.message || 'Submission uploaded successfully!');
      setTimeout(() => {
        setSelectedAssignment(null);
        fetchAssignments();
      }, 1000);
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssignments = (Array.isArray(assignments) ? assignments : []).filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.subject_name && a.subject_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.subject_code && a.subject_code.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return !a.student_submission;
    if (statusFilter === 'SUBMITTED') return a.student_submission && a.student_submission.status !== 'GRADED';
    if (statusFilter === 'GRADED') return a.student_submission && a.student_submission.status === 'GRADED';

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Course Assignments</h1>
          <p className="text-xs text-slate-500">Track task deadlines, submit lab deliverables, and review faculty feedback</p>
        </div>
      </div>

      {/* Search & Filter Bar - High Density */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assignments or subjects..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {(['ALL', 'PENDING', 'SUBMITTED', 'GRADED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List - High Density Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-slate-200">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-600">No assignments found matching your criteria.</p>
          </div>
        ) : (
          filteredAssignments.map((assign) => {
            const sub = assign.student_submission;
            const isPast = assign.is_past_deadline;

            return (
              <div
                key={assign.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {assign.subject_code}
                    </span>
                    {sub ? (
                      <Badge status={sub.status} />
                    ) : isPast ? (
                      <Badge status="DUE" />
                    ) : (
                      <Badge status="PENDING" />
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{assign.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {assign.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: {new Date(assign.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{assign.faculty_name}</span>
                    </div>
                  </div>

                  {sub && sub.marks !== null && sub.marks !== undefined && (
                    <div className="flex items-center justify-between bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs">
                      <span className="font-bold text-emerald-900">Score: {sub.marks} / 100</span>
                      <button
                        onClick={() => setViewGradeAssignment(assign)}
                        className="text-emerald-700 font-bold underline hover:text-emerald-800 text-[11px]"
                      >
                        Feedback
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openSubmitModal(assign)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        sub
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{sub ? 'Update Work' : 'Submit Work'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submit Assignment Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAssignment(null)}
          title={`Submit Assignment: ${selectedAssignment.title}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800">
                Course: {selectedAssignment.subject_code} - {selectedAssignment.subject_name}
              </div>
              <div className="text-slate-500">
                Deadline: {new Date(selectedAssignment.deadline).toLocaleString()}
              </div>
              {selectedAssignment.is_past_deadline && (
                <div className="text-amber-700 font-semibold flex items-center gap-1 pt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Notice: This assignment is past the due deadline. Submission will be marked LATE.</span>
                </div>
              )}
            </div>

            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Submission Notes / Documentation / GitHub Link *
              </label>
              <textarea
                required
                rows={4}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Explain your approach, paste solution code, circuit analysis, or repository link..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Attach Deliverable File (PDF, ZIP, C, PY)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="assignment-file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="assignment-file"
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                </label>
                <span className="text-xs text-slate-500 truncate max-w-xs font-mono">
                  {submissionFileName || 'No file chosen (default mock PDF will be recorded)'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Work</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Grade & Feedback Modal */}
      {viewGradeAssignment && viewGradeAssignment.student_submission && (
        <Modal
          isOpen={true}
          onClose={() => setViewGradeAssignment(null)}
          title="Faculty Evaluation & Feedback"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Final Score</span>
                <div className="text-2xl font-black text-emerald-900">
                  {viewGradeAssignment.student_submission.marks} / 100
                </div>
              </div>
              <Badge status={viewGradeAssignment.student_submission.status} />
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Faculty Remarks
              </h4>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                {viewGradeAssignment.student_submission.feedback || 'No written remarks provided.'}
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Submitted on: {new Date(viewGradeAssignment.student_submission.submitted_at).toLocaleString()}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewGradeAssignment(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentAssignments;
