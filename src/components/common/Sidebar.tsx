import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  MessageSquareWarning,
  Bell,
  User,
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  CheckSquare,
  Briefcase,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const studentLinks = [
    { name: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Attendance', to: '/student/attendance', icon: CalendarCheck },
    { name: 'Assignments', to: '/student/assignments', icon: FileText },
    { name: 'Announcements', to: '/student/announcements', icon: Bell },
    { name: 'Support & Complaints', to: '/student/complaints', icon: MessageSquareWarning },
    { name: 'My Profile', to: '/student/profile', icon: User }
  ];

  const facultyLinks = [
    { name: 'Dashboard', to: '/faculty/dashboard', icon: LayoutDashboard },
    { name: 'Mark Attendance', to: '/faculty/attendance', icon: CalendarCheck },
    { name: 'Assignments', to: '/faculty/assignments', icon: FileText },
    { name: 'Submissions & Grades', to: '/faculty/submissions', icon: CheckSquare },
    { name: 'Student Directory', to: '/faculty/students', icon: Users },
    { name: 'Announcements', to: '/faculty/announcements', icon: Bell }
  ];

  const adminLinks = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', to: '/admin/students', icon: GraduationCap },
    { name: 'Faculty', to: '/admin/faculty', icon: Briefcase },
    { name: 'Departments', to: '/admin/departments', icon: Building2 },
    { name: 'Subjects & Curriculum', to: '/admin/subjects', icon: BookOpen },
    { name: 'Grievance Desk', to: '/admin/complaints', icon: MessageSquareWarning },
    { name: 'Campus Bulletins', to: '/admin/announcements', icon: Bell }
  ];

  const links = role === 'STUDENT' ? studentLinks : role === 'FACULTY' ? facultyLinks : adminLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container - High Density Slate-900 Theme */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-lg text-white shadow-xs">
              C
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none">
                CampusHub
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block mt-1">
                {role ? `${role} PORTAL` : 'MANAGEMENT'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-4 overflow-y-auto px-4 space-y-1">
          <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider px-2 py-2">
            Main Menu
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}

          <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider px-2 pt-4 pb-2">
            Session Info
          </div>
          <div className="px-3 py-2 bg-slate-800/60 rounded-md border border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Term:</span>
              <span className="text-slate-200 font-medium">Odd Sem 2026</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Status:</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Active
              </span>
            </div>
          </div>
        </nav>

        {/* User Card at Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-slate-600 shrink-0 flex items-center justify-center">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-200 flex items-center justify-center text-indigo-900 font-bold text-xs">
                    {user ? `${user.first_name?.[0] || 'U'}${user.last_name?.[0] || 'S'}` : 'U'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight text-white truncate">
                  {user ? `${user.first_name} ${user.last_name}` : 'User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {user?.role === 'STUDENT'
                    ? `B.Tech - ${user.profile?.department_code || 'ECE'} (Yr ${user.profile?.year || 3})`
                    : user?.role === 'FACULTY'
                    ? `${user.profile?.designation || 'Faculty'} (${user.profile?.department_code || 'DEPT'})`
                    : 'System Administrator'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

