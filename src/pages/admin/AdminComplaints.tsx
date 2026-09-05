import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  MessageSquareWarning,
  Filter,
  Search,
  CheckCircle,
  Clock,
  Send,
  Loader2,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { Complaint } from '../../types';

export const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Resolution Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<string>('IN_PROGRESS');
  const [adminResponse, setAdminResponse] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const openResolveModal = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setNewStatus(comp.status === 'PENDING' ? 'IN_PROGRESS' : comp.status);
    setAdminResponse(comp.admin_response || '');
    setError(null);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.put(`/complaints/${selectedComplaint.id}/status/`, {
        status: newStatus,
        admin_response: adminResponse
      });

      setComplaints((prev) =>
        prev.map((c) => (c.id === selectedComplaint.id ? res.data : c))
      );
      setSelectedComplaint(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update grievance ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = (Array.isArray(complaints) ? complaints : []).filter((comp) => {
    if (statusFilter !== 'all' && comp.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && comp.category !== categoryFilter) return false;

    const matchesSearch =
      comp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.student_name && comp.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (comp.roll_number && comp.roll_number.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Grievance Ticketing Desk</h1>
          <p className="text-xs text-slate-500">
            Adjudicate infrastructure reports, campus appeals, and provide official administration resolutions
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets, student, or roll..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Ticket Statuses</option>
            <option value="PENDING">Pending Action</option>
            <option value="IN_PROGRESS">Under Investigation</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Transport">Transport</option>
            <option value="Hostel">Hostel</option>
            <option value="Library">Library</option>
            <option value="Internet">Internet</option>
            <option value="Academic">Academic</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <MessageSquareWarning className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No grievances found matching criteria.</p>
          </div>
        ) : (
          filtered.map((comp) => (
            <div
              key={comp.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    Ticket #{comp.id}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                    {comp.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{comp.subject}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <Badge status={comp.status} />
                  <span className="text-xs text-slate-400">
                    {new Date(comp.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Filed by: <strong className="text-slate-800">{comp.student_name}</strong></span>
                <span>•</span>
                <span className="font-mono">{comp.roll_number}</span>
                <span>•</span>
                <span>{comp.department_name}</span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {comp.description}
              </p>

              {comp.admin_response && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs">
                  <span className="font-bold text-purple-950 block mb-1">Official Resolution Recorded:</span>
                  <p className="text-purple-900">{comp.admin_response}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => openResolveModal(comp)}
                  className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-xl text-xs transition-colors"
                >
                  Manage Status & Reply
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolution Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedComplaint(null)}
          title={`Adjudicate Grievance Ticket #${selectedComplaint.id}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedComplaint.subject}</div>
              <div className="text-slate-500">
                Student: {selectedComplaint.student_name} ({selectedComplaint.roll_number})
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Updated Ticket Status *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="PENDING">PENDING (Open Ticket)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Under Active Investigation)</option>
                <option value="RESOLVED">RESOLVED (Corrective Action Completed)</option>
                <option value="REJECTED">REJECTED (Invalid or Out of Scope)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Official Administration Resolution Notes *
              </label>
              <textarea
                rows={4}
                required
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Detail the corrective actions taken, maintenance crew dispatch, or appeal reasoning..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
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
                  <span>Save Resolution</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminComplaints;
