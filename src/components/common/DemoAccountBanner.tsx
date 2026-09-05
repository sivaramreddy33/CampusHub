import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Shield, GraduationCap, Briefcase, RotateCcw, Check } from 'lucide-react';
import api from '../../services/api';

export const DemoAccountBanner: React.FC = () => {
  const { user, switchDemoRole } = useAuth();
  const [switching, setSwitching] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSwitch = async (role: 'STUDENT' | 'FACULTY' | 'ADMIN') => {
    try {
      setSwitching(role);
      await switchDemoRole(role);
    } catch (err) {
      console.error('Failed to switch role', err);
    } finally {
      setSwitching(null);
    }
  };

  const handleResetDB = async () => {
    try {
      await api.post('/seed/reset/');
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 800);
    } catch (err) {
      console.error('Failed to reset DB', err);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-300 px-4 py-1.5 text-xs border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">Demo Switcher:</span>
          <span className="bg-indigo-600/90 text-white px-2 py-0.5 rounded text-[11px] font-mono font-medium">
            {user ? `${user.role} (${user.first_name} ${user.last_name})` : 'Not Logged In'}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-slate-400 mr-1 text-[11px] hidden md:inline">Persona:</span>
          <button
            onClick={() => handleSwitch('STUDENT')}
            disabled={switching !== null}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
              user?.role === 'STUDENT'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-850 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <GraduationCap className="w-3 h-3" />
            <span>Student</span>
          </button>

          <button
            onClick={() => handleSwitch('FACULTY')}
            disabled={switching !== null}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
              user?.role === 'FACULTY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Faculty</span>
          </button>

          <button
            onClick={() => handleSwitch('ADMIN')}
            disabled={switching !== null}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
              user?.role === 'ADMIN'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>

          <div className="h-3.5 w-px bg-slate-800 mx-1 hidden sm:block"></div>

          <button
            onClick={handleResetDB}
            title="Reset demo data to initial pristine state"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {resetSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <RotateCcw className="w-3 h-3" />}
            <span className="hidden lg:inline">{resetSuccess ? 'Reset Done' : 'Reset Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoAccountBanner;
