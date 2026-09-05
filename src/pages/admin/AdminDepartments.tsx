import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Briefcase,
  BookOpen,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Department } from '../../types';

export const AdminDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments/');
      setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load departments', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({ code: '', name: '' });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ code: dept.code, name: dept.name });
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Are you sure you want to delete department "${code}"?`)) return;
    try {
      await api.delete(`/departments/${id}/`);
      fetchDepartments();
    } catch (err) {
      console.error('Failed to delete department', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      setError('Please fill in both department code and name.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}/`, formData);
      } else {
        await api.post('/departments/', formData);
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save department.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Departments</h1>
          <p className="text-xs text-slate-500">
            Configure collegiate faculties, branch codes, and curriculum administrative structures
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(Array.isArray(departments) ? departments : []).map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900">
                  {dept.code}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(dept)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id, dept.code)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{dept.name}</h3>
              <p className="text-xs text-slate-400">
                Established: {new Date(dept.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="block font-bold text-slate-900 text-sm">{dept.student_count ?? 0}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Students</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="block font-bold text-slate-900 text-sm">{dept.faculty_count ?? 0}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Faculty</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="block font-bold text-slate-900 text-sm">{dept.subject_count ?? 0}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Courses</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Academic Department' : 'Create Academic Department'}
        maxWidth="md"
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
              Department Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. AI-DS or CHEM"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Artificial Intelligence & Data Science"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingDept ? 'Update Department' : 'Create Department'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDepartments;
