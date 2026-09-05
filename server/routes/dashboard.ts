import { Router, Response } from 'express';
import { getDB, resetDB } from '../db.js';
import { authenticateUser, AuthRequest, requireRole } from '../auth.js';

const router = Router();

// GET /api/dashboard/admin/
router.get('/admin/', authenticateUser, requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  const db = getDB();

  const totalStudents = db.users.filter(u => u.role === 'STUDENT').length;
  const totalFaculty = db.users.filter(u => u.role === 'FACULTY').length;
  const totalDepartments = db.departments.length;
  const totalSubjects = db.subjects.length;

  // Average attendance across entire college
  const allAtt = db.attendance;
  const presentAtt = allAtt.filter(a => a.status === 'PRESENT').length;
  const averageAttendance = allAtt.length > 0 ? Math.round((presentAtt / allAtt.length) * 100) : 0;

  // Complaints summary
  const pendingComplaints = db.complaints.filter(c => c.status === 'PENDING').length;
  const inProgressComplaints = db.complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedComplaints = db.complaints.filter(c => c.status === 'RESOLVED').length;
  const rejectedComplaints = db.complaints.filter(c => c.status === 'REJECTED').length;

  // Department distribution
  const studentsByDepartment = db.departments.map(dept => {
    const count = db.student_profiles.filter(sp => sp.department_id === dept.id).length;
    const facCount = db.faculty_profiles.filter(fp => fp.department_id === dept.id).length;
    return {
      department: dept.code,
      name: dept.name,
      students: count,
      faculty: facCount
    };
  });

  // Attendance by department
  const attendanceByDepartment = db.departments.map(dept => {
    const deptSubjects = db.subjects.filter(s => s.department_id === dept.id).map(s => s.id);
    const deptRecords = db.attendance.filter(a => deptSubjects.includes(a.subject_id));
    const deptPresent = deptRecords.filter(a => a.status === 'PRESENT').length;
    const rate = deptRecords.length > 0 ? Math.round((deptPresent / deptRecords.length) * 100) : 85;
    return {
      department: dept.code,
      attendance: rate
    };
  });

  // Complaint status breakdown for charts
  const complaintStats = [
    { name: 'Pending', value: pendingComplaints, color: '#F59E0B' },
    { name: 'In Progress', value: inProgressComplaints, color: '#3B82F6' },
    { name: 'Resolved', value: resolvedComplaints, color: '#10B981' },
    { name: 'Rejected', value: rejectedComplaints, color: '#EF4444' }
  ];

  // Assignment & submission metrics
  const totalAssignments = db.assignments.length;
  const totalSubmissions = db.submissions.length;
  const gradedSubmissions = db.submissions.filter(s => s.status === 'GRADED').length;
  const lateSubmissions = db.submissions.filter(s => s.status === 'LATE').length;

  return res.json({
    total_students: totalStudents,
    total_faculty: totalFaculty,
    total_departments: totalDepartments,
    total_subjects: totalSubjects,
    average_attendance: averageAttendance,
    pending_complaints: pendingComplaints,
    in_progress_complaints: inProgressComplaints,
    resolved_complaints: resolvedComplaints,
    rejected_complaints: rejectedComplaints,
    total_assignments: totalAssignments,
    total_submissions: totalSubmissions,
    graded_submissions: gradedSubmissions,
    late_submissions: lateSubmissions,
    students_by_department: studentsByDepartment,
    attendance_by_department: attendanceByDepartment,
    complaint_stats: complaintStats
  });
});

// POST /api/seed/reset/ (Reset demo database to original state)
router.post('/seed/reset/', (req, res) => {
  const freshData = resetDB();
  return res.json({
    message: 'Demo database reset successfully.',
    users_count: freshData.users.length,
    departments_count: freshData.departments.length,
    subjects_count: freshData.subjects.length,
    attendance_records: freshData.attendance.length
  });
});

export default router;
