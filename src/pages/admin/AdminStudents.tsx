import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  User,
  Mail,
  Lock,
  Phone,
  Hash,
  Building2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Department } from '../../types';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    roll_number: '',
    department_id: '',
    year: '1',
    section: 'A',
    date_of_birth: '2004-01-01',
    address: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, deptRes] = await Promise.all([
        api.get('/students/'),
        api.get('/departments/')
      ]);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      if (Array.isArray(deptRes.data) && deptRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, department_id: String(deptRes.data[0].id) }));
      }
    } catch (err) {
      console.error('Failed to load students data', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      roll_number: '',
      department_id: departments.length > 0 ? String(departments[0].id) : '',
      year: '1',
      section: 'A',
      date_of_birth: '2004-01-01',
      address: ''
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      username: student.username,
      email: student.email,
      password: '',
      phone: student.phone || '',
      roll_number: student.profile?.roll_number || '',
      department_id: String(student.profile?.department_id || (departments[0]?.id || '')),
      year: String(student.profile?.year || '1'),
      section: student.profile?.section || 'A',
      date_of_birth: student.profile?.date_of_birth || '2004-01-01',
      address: student.profile?.address || ''
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}"? This deletes attendance and submission history.`)) {
      return;
    }
    try {
      await api.delete(`/students/${id}/`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete student', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}/`, formData);
      } else {
        await api.post('/students/', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const resp = err.response?.data;
      setModalError(resp?.roll_number?.[0] || resp?.email?.[0] || resp?.detail || 'Failed to save student record');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = (Array.isArray(students) ? students : []).filter((s) => {
    if (deptFilter !== 'all' && s.profile?.department_id !== Number(deptFilter)) {
      return false;
    }
    const matchesSearch =
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.profile?.roll_number && s.profile.roll_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Enrollment Registry</h1>
          <p className="text-xs text-slate-500">
            Admit new students, update academic standing, and oversee branch allocations
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Admit Student</span>
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
            placeholder="Search by name, roll, or email..."
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

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Roll Number</th>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Year / Section</th>
                <th className="px-6 py-3.5">Phone</th>
                <th className="px-6 py-3.5 text-center">Attendance</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const rate = s.profile?.attendance_percentage ?? 85;
                  const isWarning = rate < 75;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {s.profile?.roll_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {s.first_name} {s.last_name}
                        </div>
                        <div className="text-xs text-slate-400">{s.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded text-xs">
                          {s.profile?.department_code || 'DEPT'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-700">
                        Year {s.profile?.year}, Sec {s.profile?.section}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-600">
                        {s.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isWarning
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {rate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Student"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, `${s.first_name} ${s.last_name}`)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Remove Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'Admit New B.Tech Student'}
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
                Email Address *
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

          {!editingStudent && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Initial Password *
              </label>
              <input
                type="password"
                required={!editingStudent}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Student@123"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Roll Number *
              </label>
              <input
                type="text"
                required
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                placeholder="2026ECE099"
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Section
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
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
                <span>{editingStudent ? 'Save Changes' : 'Admit Student'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStudents;
