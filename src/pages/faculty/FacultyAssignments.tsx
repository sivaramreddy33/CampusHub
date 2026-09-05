import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
  Send,
  Loader2
} from 'lucide-react';
import { Assignment, Subject } from '../../types';

export const FacultyAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    deadline: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignRes, subRes] = await Promise.all([
        api.get('/assignments/'),
        api.get('/subjects/')
      ]);
      setAssignments(assignRes.data);
      setSubjects(subRes.data);
      if (subRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, subject_id: String(subRes.data[0].id) }));
      }
    } catch (err) {
      console.error('Failed to load assignments', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAssignment(null);
    const inOneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    setFormData({
      title: '',
      description: '',
      subject_id: subjects.length > 0 ? String(subjects[0].id) : '',
      deadline: inOneWeek
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (assign: Assignment) => {
    setEditingAssignment(assign);
    setFormData({
      title: assign.title,
      description: assign.description,
      subject_id: String(assign.subject_id),
      deadline: new Date(assign.deadline).toISOString().slice(0, 16)
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this assignment and all associated student submissions?')) {
      return;
    }
    try {
      await api.delete(`/assignments/${id}/`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete assignment', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.subject_id || !formData.deadline) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingAssignment) {
        await api.put(`/assignments/${editingAssignment.id}/`, formData);
      } else {
        await api.post('/assignments/', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assignment Management</h1>
          <p className="text-xs text-slate-500">
            Publish academic problem sets, laboratory briefs, and track student submissions
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No assignments posted yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click "New Assignment" to post your first lab or task brief.</p>
          </div>
        ) : (
          assignments.map((assign) => (
            <div
              key={assign.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                    {assign.subject_code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(assign)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit Assignment"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(assign.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Assignment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{assign.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                  {assign.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: {new Date(assign.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <Users className="w-3.5 h-3.5" />
                    <span>{assign.total_submissions || 0} Submissions</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/faculty/submissions')}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Review & Grade Submissions</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? 'Edit Assignment' : 'Create New Course Assignment'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Subject / Course *
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name} (Semester {sub.semester})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Lab 4: FFT Implementation and Spectral Analysis"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Submission Deadline *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Instructions & Deliverables *
            </label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline project expectations, testbench parameters, formatting rules, and evaluation criteria..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingAssignment ? 'Update Assignment' : 'Publish Assignment'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyAssignments;
