import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Bell,
  Plus,
  Calendar,
  User,
  Trash2,
  Edit2,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Announcement, Department } from '../../types';

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    department_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [annRes, deptRes] = await Promise.all([
        api.get('/announcements/'),
        api.get('/departments/')
      ]);
      setAnnouncements(Array.isArray(annRes.data) ? annRes.data : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAnn(null);
    setFormData({ title: '', content: '', department_id: '' });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ann: Announcement) => {
    setEditingAnn(ann);
    setFormData({
      title: ann.title,
      content: ann.content,
      department_id: ann.department_id ? String(ann.department_id) : ''
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this bulletin notice?')) return;
    try {
      await api.delete(`/announcements/${id}/`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete announcement', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Title and content are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        department_id: formData.department_id ? Number(formData.department_id) : null
      };

      if (editingAnn) {
        await api.put(`/announcements/${editingAnn.id}/`, payload);
      } else {
        await api.post('/announcements/', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to publish announcement.');
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Bulletins & Notices</h1>
          <p className="text-xs text-slate-500">
            Publish campus-wide notifications, fee deadlines, academic circulars, and departmental memos
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Bulletin Notice</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {(Array.isArray(announcements) ? announcements : []).map((ann) => (
          <div
            key={ann.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  {ann.department_name}
                </span>
                <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {new Date(ann.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => openEditModal(ann)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {ann.content}
            </p>

            <div className="pt-2 text-[11px] text-slate-400">
              Published by: <strong className="text-slate-700">{ann.creator_name}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Bulletin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAnn ? 'Edit Bulletin Notice' : 'Publish Institutional Notice'}
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
              Target Scope *
            </label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
            >
              <option value="">All Departments (General Campus Notice)</option>
              {(Array.isArray(departments) ? departments : []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Mid-Term Examination Schedule Released"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notice Content *
            </label>
            <textarea
              required
              rows={5}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter official circular details, deadlines, and instructions..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
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
                <span>{editingAnn ? 'Update Notice' : 'Publish Notice'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAnnouncements;
