import { Router, Response } from 'express';
import { getDB } from '../db.js';
import { authenticateUser, AuthRequest, requireRole } from '../auth.js';

const router = Router();

// GET /api/faculty/
router.get('/', authenticateUser, (req: AuthRequest, res: Response) => {
  const { search, department } = req.query;
  const db = getDB();

  let results = db.users
    .filter(u => u.role === 'FACULTY')
    .map(user => {
      const profile = db.faculty_profiles.find(fp => fp.user_id === user.id);
      const dept = profile ? db.departments.find(d => d.id === profile.department_id) : null;
      const subjects = db.subjects.filter(s => s.faculty_id === user.id);
      const { password_hash, ...safeUser } = user;
      return {
        ...safeUser,
        profile: profile ? {
          ...profile,
          department_name: dept ? dept.name : '',
          department_code: dept ? dept.code : ''
        } : null,
        assigned_subjects: subjects
      };
    });

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(f =>
      f.first_name.toLowerCase().includes(q) ||
      f.last_name.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      (f.profile && f.profile.employee_id.toLowerCase().includes(q))
    );
  }

  if (department) {
    results = results.filter(f => f.profile && f.profile.department_id === Number(department));
  }

  return res.json(results);
});

// GET /api/faculty/dashboard/
router.get('/dashboard/', authenticateUser, requireRole('FACULTY'), (req: AuthRequest, res: Response) => {
  const faculty = req.user!;
  const db = getDB();
  const profile = db.faculty_profiles.find(fp => fp.user_id === faculty.id);
  const dept = profile ? db.departments.find(d => d.id === profile.department_id) : null;

  // Assigned subjects
  const assignedSubjects = db.subjects.filter(s => s.faculty_id === faculty.id);
  const assignedSubjectIds = assignedSubjects.map(s => s.id);

  // Total students enrolled in faculty's department / subjects
  const enrolledStudents = db.student_profiles.filter(
    sp => profile && sp.department_id === profile.department_id
  );

  // Assignments created by faculty
  const facultyAssignments = db.assignments.filter(a => a.faculty_id === faculty.id);
  const assignmentIds = facultyAssignments.map(a => a.id);

  // Submissions for faculty's assignments
  const submissions = db.submissions.filter(s => assignmentIds.includes(s.assignment_id));
  const pendingGrading = submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'LATE');
  const gradedSubmissions = submissions.filter(s => s.status === 'GRADED');

  // Average attendance across assigned subjects
  const subjectAttendanceStats = assignedSubjects.map(sub => {
    const records = db.attendance.filter(a => a.subject_id === sub.id);
    const total = records.length;
    const present = records.filter(a => a.status === 'PRESENT').length;
    const avg = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      subject_name: sub.name,
      subject: sub.name,
      subject_code: sub.code,
      code: sub.code,
      records_count: total,
      total_classes: total,
      average_attendance: avg
    };
  });

  // Enriched assigned subjects with student counts
  const subjectsWithCounts = assignedSubjects.map(sub => {
    const studentCount = db.student_profiles.filter(sp => sp.department_id === sub.department_id).length;
    return {
      ...sub,
      student_count: studentCount
    };
  });

  // Recent submissions needing evaluation
  const recentSubmissions = submissions
    .slice(-5)
    .reverse()
    .map(sub => {
      const assignment = db.assignments.find(a => a.id === sub.assignment_id);
      const studentUser = db.users.find(u => u.id === sub.student_id);
      const studentProfile = db.student_profiles.find(sp => sp.user_id === sub.student_id);
      return {
        ...sub,
        assignment_title: assignment ? assignment.title : 'Assignment',
        student_name: studentUser ? `${studentUser.first_name} ${studentUser.last_name}` : 'Student',
        roll_number: studentProfile ? studentProfile.roll_number : ''
      };
    });

  return res.json({
    faculty: {
      name: `${faculty.first_name} ${faculty.last_name}`,
      employee_id: profile ? profile.employee_id : '',
      department: dept ? dept.name : '',
      department_code: dept ? dept.code : '',
      designation: profile ? profile.designation : 'Faculty',
      email: faculty.email,
      phone: faculty.phone
    },
    total_students: enrolledStudents.length,
    total_students_taught: enrolledStudents.length,
    total_subjects: assignedSubjects.length,
    total_assigned_subjects: assignedSubjects.length,
    active_assignments: facultyAssignments.length,
    total_assignments_created: facultyAssignments.length,
    pending_submissions: pendingGrading.length,
    pending_evaluations_count: pendingGrading.length,
    graded_submissions: gradedSubmissions.length,
    subjects: subjectsWithCounts,
    assigned_subjects: subjectsWithCounts,
    subject_attendance_stats: subjectAttendanceStats,
    submission_stats: [
      { name: 'Pending Review', value: pendingGrading.length, color: '#F59E0B' },
      { name: 'Evaluated', value: gradedSubmissions.length, color: '#10B981' }
    ],
    recent_submissions: recentSubmissions
  });
});

// GET /api/faculty/:id/
router.get('/:id', authenticateUser, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const db = getDB();
  const user = db.users.find(u => u.id === id && u.role === 'FACULTY');

  if (!user) {
    return res.status(404).json({ detail: 'Faculty member not found' });
  }

  const profile = db.faculty_profiles.find(fp => fp.user_id === user.id);
  const dept = profile ? db.departments.find(d => d.id === profile.department_id) : null;
  const subjects = db.subjects.filter(s => s.faculty_id === user.id);
  const { password_hash, ...safeUser } = user;

  return res.json({
    ...safeUser,
    profile: profile ? {
      ...profile,
      department_name: dept ? dept.name : '',
      department_code: dept ? dept.code : ''
    } : null,
    assigned_subjects: subjects
  });
});

export default router;
