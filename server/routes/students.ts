import { Router, Response } from 'express';
import { getDB, saveDB } from '../db.js';
import { authenticateUser, AuthRequest, requireRole } from '../auth.js';

const router = Router();

// GET /api/students/ (List students, with search and filters)
router.get('/', authenticateUser, (req: AuthRequest, res: Response) => {
  const { search, department, year } = req.query;
  const db = getDB();

  let results = db.users
    .filter(u => u.role === 'STUDENT')
    .map(user => {
      const profile = db.student_profiles.find(sp => sp.user_id === user.id);
      const dept = profile ? db.departments.find(d => d.id === profile.department_id) : null;
      const { password_hash, ...safeUser } = user;
      return {
        ...safeUser,
        profile: profile ? {
          ...profile,
          department_name: dept ? dept.name : '',
          department_code: dept ? dept.code : ''
        } : null
      };
    });

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(s =>
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.profile && s.profile.roll_number.toLowerCase().includes(q))
    );
  }

  if (department) {
    results = results.filter(s => s.profile && s.profile.department_id === Number(department));
  }

  if (year) {
    results = results.filter(s => s.profile && s.profile.year === Number(year));
  }

  return res.json(results);
});

// GET /api/students/dashboard/
router.get('/dashboard/', authenticateUser, requireRole('STUDENT'), (req: AuthRequest, res: Response) => {
  const student = req.user!;
  const db = getDB();
  const profile = db.student_profiles.find(sp => sp.user_id === student.id);
  const dept = profile ? db.departments.find(d => d.id === profile.department_id) : null;

  // Student's subjects:
  const studentSubjects = profile
    ? db.subjects.filter(s => s.department_id === profile.department_id)
    : [];

  // Attendance metrics per subject
  const attendanceBySubject = studentSubjects.map(sub => {
    const subjectAttendance = db.attendance.filter(
      a => a.student_id === student.id && a.subject_id === sub.id
    );
    const totalClasses = subjectAttendance.length;
    const presentClasses = subjectAttendance.filter(a => a.status === 'PRESENT').length;
    const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;
    return {
      subject_id: sub.id,
      subject_name: sub.name,
      subject_code: sub.code,
      present_classes: presentClasses,
      total_classes: totalClasses,
      percentage,
      is_low: percentage < 75 && totalClasses > 0
    };
  });

  const totalClassesAttended = attendanceBySubject.reduce((acc, curr) => acc + curr.present_classes, 0);
  const totalClassesConducted = attendanceBySubject.reduce((acc, curr) => acc + curr.total_classes, 0);
  const overallAttendance = totalClassesConducted > 0
    ? Math.round((totalClassesAttended / totalClassesConducted) * 100)
    : 100;

  // Assignments for student's subjects
  const subjectIds = studentSubjects.map(s => s.id);
  const studentAssignments = db.assignments.filter(a => subjectIds.includes(a.subject_id));
  const studentSubmissions = db.submissions.filter(sub => sub.student_id === student.id);

  const submittedAssignmentIds = studentSubmissions.map(s => s.assignment_id);
  const pendingAssignments = studentAssignments.filter(a => !submittedAssignmentIds.includes(a.id));
  const gradedSubmissions = studentSubmissions.filter(s => s.status === 'GRADED');

  // Complaints
  const studentComplaints = db.complaints.filter(c => c.student_id === student.id);
  const complaintsByStatus = {
    PENDING: studentComplaints.filter(c => c.status === 'PENDING').length,
    IN_PROGRESS: studentComplaints.filter(c => c.status === 'IN_PROGRESS').length,
    RESOLVED: studentComplaints.filter(c => c.status === 'RESOLVED').length,
    REJECTED: studentComplaints.filter(c => c.status === 'REJECTED').length
  };

  // Recent announcements (dept or general)
  const recentAnnouncements = db.announcements
    .filter(a => !a.department_id || (profile && a.department_id === profile.department_id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(a => {
      const creator = db.users.find(u => u.id === a.created_by);
      const annDept = a.department_id ? db.departments.find(d => d.id === a.department_id) : null;
      return {
        ...a,
        creator_name: creator ? `${creator.first_name} ${creator.last_name}` : 'Campus Admin',
        department_name: annDept ? annDept.name : 'All Departments (General)'
      };
    });

  return res.json({
    student: {
      name: `${student.first_name} ${student.last_name}`,
      roll_number: profile ? profile.roll_number : '',
      department: dept ? dept.name : '',
      department_code: dept ? dept.code : '',
      year: profile ? profile.year : 1,
      section: profile ? profile.section : 'A',
      email: student.email,
      phone: student.phone
    },
    overall_attendance: overallAttendance,
    is_attendance_warning: overallAttendance < 75,
    attendance_by_subject: attendanceBySubject,
    total_assignments: studentAssignments.length,
    pending_assignments_count: pendingAssignments.length,
    submitted_assignments_count: studentSubmissions.length,
    graded_assignments_count: gradedSubmissions.length,
    assignment_stats: [
      { name: 'Submitted', value: studentSubmissions.filter(s => s.status !== 'LATE').length, color: '#10B981' },
      { name: 'Late', value: studentSubmissions.filter(s => s.status === 'LATE').length, color: '#F59E0B' },
      { name: 'Pending', value: pendingAssignments.length, color: '#EF4444' }
    ],
    complaint_count: studentComplaints.length,
    complaints_by_status: complaintsByStatus,
    recent_announcements: recentAnnouncements
  });
});

// GET /api/students/:id/
router.get('/:id', authenticateUser, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const db = getDB();
  const user = db.users.find(u => u.id === id && u.role === 'STUDENT');

  if (!user) {
    return res.status(404).json({ detail: 'Student not found' });
  }

  const profile = db.student_profiles.find(sp => sp.user_id === user.id);
  const dept = profile ? db.departments.find(d => d.id === profile.department_id) : null;
  const { password_hash, ...safeUser } = user;

  return res.json({
    ...safeUser,
    profile: profile ? {
      ...profile,
      department_name: dept ? dept.name : '',
      department_code: dept ? dept.code : ''
    } : null
  });
});

// PUT /api/students/profile/ (Student updates own profile)
router.put('/profile/', authenticateUser, requireRole('STUDENT'), (req: AuthRequest, res: Response) => {
  const student = req.user!;
  const db = getDB();
  const { phone, date_of_birth, address, profile_image } = req.body;

  // Update user table
  const userIndex = db.users.findIndex(u => u.id === student.id);
  if (userIndex !== -1) {
    if (phone !== undefined) db.users[userIndex].phone = phone;
    if (profile_image !== undefined) db.users[userIndex].profile_image = profile_image;
  }

  // Update profile table
  const profileIndex = db.student_profiles.findIndex(sp => sp.user_id === student.id);
  if (profileIndex !== -1) {
    if (date_of_birth) db.student_profiles[profileIndex].date_of_birth = date_of_birth;
    if (address) db.student_profiles[profileIndex].address = address;
  }

  saveDB(db);

  const updatedUser = db.users[userIndex];
  const updatedProfile = db.student_profiles[profileIndex];
  const dept = updatedProfile ? db.departments.find(d => d.id === updatedProfile.department_id) : null;
  const { password_hash, ...safeUser } = updatedUser;

  return res.json({
    ...safeUser,
    profile: updatedProfile ? {
      ...updatedProfile,
      department_name: dept ? dept.name : '',
      department_code: dept ? dept.code : ''
    } : null,
    detail: 'Profile updated successfully.'
  });
});

export default router;
