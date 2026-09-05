import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Hash,
  Building2,
  Calendar,
  MapPin,
  Save,
  Check,
  AlertCircle,
  Camera,
  Loader2
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, refreshUserProfile } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone: '',
    date_of_birth: '',
    address: '',
    profile_image: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students/profile/');
      setProfileData(res.data);
      setFormData({
        phone: res.data.phone || '',
        date_of_birth: res.data.profile?.date_of_birth || '',
        address: res.data.profile?.address || '',
        profile_image: res.data.profile_image || ''
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.put('/students/profile/', formData);
      setSuccess(true);
      await refreshUserProfile();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Academic Profile</h1>
        <p className="text-xs text-slate-500">View official enrollment credentials and manage contact details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card / Identification */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img
              src={formData.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData?.username}`}
              alt={profileData?.first_name}
              className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-md object-cover bg-slate-50"
            />
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            {profileData?.first_name} {profileData?.last_name}
          </h2>
          <p className="text-xs font-mono font-semibold text-indigo-600 mt-0.5">
            {profileData?.profile?.roll_number}
          </p>

          <div className="mt-4 pt-4 border-t border-slate-100 w-full space-y-2.5 text-xs text-left text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="font-semibold text-slate-800">{profileData?.profile?.department_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Class:</span>
              <span className="font-semibold text-slate-800">
                Year {profileData?.profile?.year}, Section {profileData?.profile?.section}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[150px]">{profileData?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Account Type:</span>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">B.Tech Student</span>
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Contact & Personal Information</h3>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Academic profile updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={formData.profile_image}
                onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Residential / Hostel Address
              </label>
              <div className="relative">
                <div className="absolute top-2.5 left-3 flex items-start pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
