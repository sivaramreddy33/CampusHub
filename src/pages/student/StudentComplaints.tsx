import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  MessageSquareWarning,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Loader2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Complaint } from '../../types';

const CATEGORIES = [
  'Infrastructure',
  'Transport',
  'Hostel',
  'Library',
  'Internet',
  'Academic',
  'Other'
] as const;

export const StudentComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: 'Infrastructure',
    subject: '',
    description: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/');
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      setError('Please provide both subject and description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/complaints/', formData);
      setIsModalOpen(false);
      setFormData({ category: 'Infrastructure', subject: '', description: '' });
      fetchComplaints();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit grievance');
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Grievances & Support</h1>
          <p className="text-xs text-slate-500">
            Submit facility concerns, lab equipment issues, or academic appeals for administration review
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Grievance Ticket</span>
        </button>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {(Array.isArray(complaints) ? complaints : []).length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <MessageSquareWarning className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No grievance tickets lodged yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              If you encounter equipment or campus issues, click "New Grievance Ticket" above.
            </p>
          </div>
        ) : (
          (Array.isArray(complaints) ? complaints : []).map((comp) => (
            <div
              key={comp.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    #{comp.id}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {comp.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{comp.subject}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={comp.status} />
                  <span className="text-[11px] text-slate-400">
                    {new Date(comp.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                {comp.description}
              </p>

              {/* Admin response if available */}
              {comp.admin_response && (
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Official Institutional Response:</span>
                  </div>
                  <p className="text-indigo-950 leading-relaxed">{comp.admin_response}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Complaint Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lodge New Grievance Ticket"
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
              Concern Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Subject / Brief Title *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Lab Oscilloscope Channel 2 Calibration Error"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide specific station numbers, location, timings, and impact..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentComplaints;
