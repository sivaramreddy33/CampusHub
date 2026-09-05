import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Building2,
  User,
  Search,
  Filter,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Subject, Department } from '../../types';

export const AdminSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department_id: '',
    semester: '5',
    faculty_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, deptRes, facRes] = await Promise.all([
        api.get('/subjects/'),
        api.get('/departments/'),
        api.get('/faculty/')
      ]);
      setSubjects(Array.isArray(subRes.data) ? subRes.data : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setFacultyList(Array.isArray(facRes.data) ? facRes.data : []);
      if (Array.isArray(deptRes.data) && deptRes.data.length > 0 && Array.isArray(facRes.data) && facRes.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          department_id: String(deptRes.data[0].id),
          faculty_id: String(facRes.data[0].id)
        }));
      }
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({
      code: '',
      name: '',
      department_id: departments.length > 0 ? String(departments[0].id) : '',
      semester: '5',
      faculty_id: facultyList.length > 0 ? String(facultyList[0].id) : ''
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setFormData({
      code: sub.code,
      name: sub.name,
      department_id: String(sub.department_id),
      semester: String(sub.semester),
      faculty_id: String(sub.faculty_id)
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Are you sure you want to delete course "${code}"?`)) return;
    try {
      await api.delete(`/subjects/${id}/`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete course', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.department_id || !formData.faculty_id) {
      setError('Please fill in all course fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}/`, formData);
      } else {
        await api.post('/subjects/', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = (Array.isArray(subjects) ? subjects : []).filter((s) => {
    if (deptFilter !== 'all' && s.department_id !== Number(deptFilter)) {
      return false;
    }
    const matchesSearch =
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.faculty_name && s.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()));

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Curriculum Course Catalog</h1>
          <p className="text-xs text-slate-500">
            Define subjects, semester syllabi, and faculty course assignments
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
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
            placeholder="Search by course code, name, or faculty..."
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Course Code</th>
                <th className="px-6 py-3.5">Course Title</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5 text-center">Semester</th>
                <th className="px-6 py-3.5">Assigned Instructor</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400">
                    No curriculum courses found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {s.code}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {s.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded text-xs">
                        {s.department_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">
                      Semester {s.semester}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                      {s.faculty_name}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.code)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
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

      {/* Subject Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Add New Curriculum Course'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. EC501"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Digital Signal Processing & Filter Design"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Academic Department *
            </label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
            >
              {(Array.isArray(departments) ? departments : []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assigned Instructor *
            </label>
            <select
              value={formData.faculty_id}
              onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
            >
              {(Array.isArray(facultyList) ? facultyList : []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.first_name} {f.last_name} ({f.profile?.employee_id})
                </option>
              ))}
            </select>
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
                <span>{editingSubject ? 'Update Course' : 'Create Course'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSubjects;
