import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layers, Shield, GraduationCap, Briefcase, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (loggedUser.role === 'FACULTY') {
        navigate('/faculty/dashboard');
      } else if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await login(demoEmail, demoPass);
      if (loggedUser.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (loggedUser.role === 'FACULTY') {
        navigate('/faculty/dashboard');
      } else if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center text-white shadow-lg shadow-indigo-200 mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          CampusHub Portal
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Student Management & Services Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campushub.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              One-Click Demo Access
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('student@campushub.com', 'Student@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-800 transition-all group"
              >
                <GraduationCap className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Student</span>
                <span className="text-[10px] text-blue-600/70 font-mono">Student@123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('faculty@campushub.com', 'Faculty@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-800 transition-all group"
              >
                <Briefcase className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Faculty</span>
                <span className="text-[10px] text-emerald-600/70 font-mono">Faculty@123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@campushub.com', 'Admin@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-purple-800 transition-all group"
              >
                <Shield className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Admin</span>
                <span className="text-[10px] text-purple-600/70 font-mono">Admin@123</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Are you a new student?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Register an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
