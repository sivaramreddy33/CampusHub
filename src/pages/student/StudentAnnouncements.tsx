import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bell, Calendar, User, Building2, Search, Filter } from 'lucide-react';
import { Announcement } from '../../types';

export const StudentAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements/');
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = (Array.isArray(announcements) ? announcements : []).filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.department_name && a.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Bulletins & Notices</h1>
          <p className="text-xs text-slate-500">Official circulars, academic schedules, and departmental announcements</p>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search circulars..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 shadow-xs"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No notices found.</p>
          </div>
        ) : (
          filtered.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {ann.department_name}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Published by: {ann.creator_name}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentAnnouncements;
