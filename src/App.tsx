import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Role } from './types';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentComplaints from './pages/student/StudentComplaints';
import StudentAnnouncements from './pages/student/StudentAnnouncements';
import StudentProfile from './pages/student/StudentProfile';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyAttendance from './pages/faculty/FacultyAttendance';
import FacultyAssignments from './pages/faculty/FacultyAssignments';
import FacultySubmissions from './pages/faculty/FacultySubmissions';
import FacultyStudents from './pages/faculty/FacultyStudents';
import FacultyAnnouncements from './pages/faculty/FacultyAnnouncements';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminFaculty from './pages/admin/AdminFaculty';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';

// Helper component for root redirection based on role
const RootRedirect: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === Role.STUDENT) {
    return <Navigate to="/student/dashboard" replace />;
  } else if (user.role === Role.FACULTY) {
    return <Navigate to="/faculty/dashboard" replace />;
  } else if (user.role === Role.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={[Role.STUDENT]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="complaints" element={<StudentComplaints />} />
            <Route path="announcements" element={<StudentAnnouncements />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Faculty Protected Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={[Role.FACULTY]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/faculty/dashboard" replace />} />
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="attendance" element={<FacultyAttendance />} />
            <Route path="assignments" element={<FacultyAssignments />} />
            <Route path="submissions" element={<FacultySubmissions />} />
            <Route path="students" element={<FacultyStudents />} />
            <Route path="announcements" element={<FacultyAnnouncements />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="faculty" element={<AdminFaculty />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
