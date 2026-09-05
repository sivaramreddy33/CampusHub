import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Bell,
  Plus,
  Calendar,
  User,
  Trash2,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Announcement } from '../../types';

export const FacultyAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements/');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Please provide title and content.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/announcements/', formData);
      setIsModalOpen(false);
      setFormData({ title: '', content: '' });
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to publish announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}/`);
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Department Notices & Bulletins</h1>
          <p className="text-xs text-slate-500">
            Publish reminders, seminar schedules, and exam updates to your enrolled students
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No announcements posted yet.</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {ann.department_name}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              <div className="pt-2 text-[11px] text-slate-400">
                Posted by: <strong className="text-slate-700">{ann.creator_name}</strong>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Department Announcement"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Remedial Lab Session for Signal Processing"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
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
              placeholder="Type the full notice body here..."
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
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Notice</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyAnnouncements;
