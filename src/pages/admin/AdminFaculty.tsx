import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Department } from '../../types';

export const AdminFaculty: React.FC = () => {
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    employee_id: '',
    department_id: '',
    designation: 'Associate Professor'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facRes, deptRes] = await Promise.all([
        api.get('/faculty/'),
        api.get('/departments/')
      ]);
      setFacultyList(Array.isArray(facRes.data) ? facRes.data : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      if (Array.isArray(deptRes.data) && deptRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, department_id: String(deptRes.data[0].id) }));
      }
    } catch (err) {
      console.error('Failed to load faculty', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingFaculty(null);
    setFormData({
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      employee_id: '',
      department_id: departments.length > 0 ? String(departments[0].id) : '',
      designation: 'Associate Professor'
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (fac: any) => {
    setEditingFaculty(fac);
    setFormData({
      first_name: fac.first_name,
      last_name: fac.last_name,
      username: fac.username,
      email: fac.email,
      password: '',
      phone: fac.phone || '',
      employee_id: fac.profile?.employee_id || '',
      department_id: String(fac.profile?.department_id || (departments[0]?.id || '')),
      designation: fac.profile?.designation || 'Associate Professor'
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove faculty member "${name}"?`)) {
      return;
    }
    try {
      await api.delete(`/faculty/${id}/`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete faculty', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    try {
      if (editingFaculty) {
        await api.put(`/faculty/${editingFaculty.id}/`, formData);
      } else {
        await api.post('/faculty/', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const resp = err.response?.data;
      setModalError(resp?.employee_id?.[0] || resp?.email?.[0] || resp?.detail || 'Failed to save faculty record');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = (Array.isArray(facultyList) ? facultyList : []).filter((f) => {
    if (deptFilter !== 'all' && f.profile?.department_id !== Number(deptFilter)) {
      return false;
    }
    const matchesSearch =
      `${f.first_name} ${f.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.profile?.employee_id && f.profile.employee_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase());

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty & Instructional Staff</h1>
          <p className="text-xs text-slate-500">
            Maintain professor profiles, departmental appointments, and teaching assignments
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Appoint Faculty</span>
        </button>
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
            placeholder="Search by name, ID, or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Departments</option>
            {(Array.isArray(departments) ? departments : []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Employee ID</th>
                <th className="px-6 py-3.5">Faculty Member</th>
                <th className="px-6 py-3.5">Designation</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Phone</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400">
                    No faculty found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {f.profile?.employee_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={f.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.username}`}
                          alt={f.first_name}
                          className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-slate-50"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {f.first_name} {f.last_name}
                          </div>
                          <div className="text-xs text-slate-400">{f.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 text-xs">
                      {f.profile?.designation || 'Instructor'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded text-xs">
                        {f.profile?.department_name || 'Department'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      {f.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(f)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit Faculty"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id, `${f.first_name} ${f.last_name}`)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove Faculty"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaculty ? 'Edit Faculty Record' : 'Appoint Faculty Member'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Academic Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
          </div>

          {!editingFaculty && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <input
                type="password"
                required={!editingFaculty}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Faculty@123"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                placeholder="FAC-ECE-105"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department *
              </label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              >
                {(Array.isArray(departments) ? departments : []).map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Designation *
              </label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              >
                <option value="Professor & HOD">Professor & HOD</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Adjunct Lecturer">Adjunct Lecturer</option>
              </select>
            </div>
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
                <span>{editingFaculty ? 'Save Changes' : 'Appoint Faculty'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminFaculty;
