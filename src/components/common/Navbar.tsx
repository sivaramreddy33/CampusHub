import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, Search, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Overview';
    if (path.includes('attendance')) return 'Attendance';
    if (path.includes('assignments')) return 'Assignments';
    if (path.includes('submissions')) return 'Submissions & Grades';
    if (path.includes('complaints')) return 'Support & Complaints';
    if (path.includes('announcements')) return 'Announcements';
    if (path.includes('students')) return 'Students Registry';
    if (path.includes('faculty')) return 'Faculty Directory';
    if (path.includes('departments')) return 'Departments';
    if (path.includes('subjects')) return 'Curriculum';
    if (path.includes('profile')) return 'My Profile';
    return 'Overview';
  };

  const getPortalName = () => {
    switch (user?.role) {
      case 'STUDENT':
        return 'Student Dashboard';
      case 'FACULTY':
        return 'Faculty Console';
      case 'ADMIN':
        return 'Admin Control';
      default:
        return 'CampusHub';
    }
  };

  const handleQuickAction = () => {
    if (user?.role === 'STUDENT') {
      navigate('/student/assignments');
    } else if (user?.role === 'FACULTY') {
      navigate('/faculty/attendance');
    } else if (user?.role === 'ADMIN') {
      navigate('/admin/announcements');
    }
  };

  const getQuickActionLabel = () => {
    if (user?.role === 'STUDENT') return 'Register for Course';
    if (user?.role === 'FACULTY') return 'Mark Attendance';
    return 'Publish Notice';
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-8 flex-shrink-0 sticky top-0 z-30">
      {/* Left: Mobile Toggle & High Density Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{getPortalName()}</span>
          <span className="opacity-40">/</span>
          <span className="text-slate-500 font-medium">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Right: Search, Notifications, Quick Action & User */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* High Density Search input */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search portal..."
            className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-lg text-xs w-48 lg:w-64 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-800 placeholder-slate-400"
          />
          <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400 pointer-events-none" />
        </div>

        {/* Notification bell & Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (user?.role === 'STUDENT') navigate('/student/announcements');
              else if (user?.role === 'FACULTY') navigate('/faculty/announcements');
              else navigate('/admin/announcements');
            }}
            title="View Announcements"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          </button>

          {/* Quick Action Button */}
          <button
            onClick={handleQuickAction}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors hidden sm:inline-block shadow-xs"
          >
            {getQuickActionLabel()}
          </button>
        </div>

        {/* Subtle separator */}
        <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

        {/* User preview */}
        <div
          onClick={() => user?.role === 'STUDENT' && navigate('/student/profile')}
          className={`flex items-center gap-2.5 ${user?.role === 'STUDENT' ? 'cursor-pointer' : ''}`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
            {user?.profile_image ? (
              <img src={user.profile_image} alt={user.first_name} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.first_name?.[0] || 'U'}</span>
            )}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
              {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium capitalize">
              {user?.role.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Quick logout */}
        <button
          onClick={logout}
          title="Log out"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
