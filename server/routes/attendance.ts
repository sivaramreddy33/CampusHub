import { Router, Response } from 'express';
import { getDB, saveDB, Attendance } from '../db.js';
import { authenticateUser, AuthRequest, requireRole } from '../auth.js';

const router = Router();

// GET /api/attendance/
router.get('/', authenticateUser, (req: AuthRequest, res: Response) => {
  const subjectParam = req.query.subject || req.query.subject_id;
  const studentParam = req.query.student || req.query.student_id;
  const { date } = req.query;
  const user = req.user!;
  const db = getDB();

  let results = db.attendance.map(att => {
    const studentUser = db.users.find(u => u.id === att.student_id);
    const studentProfile = db.student_profiles.find(sp => sp.user_id === att.student_id);
    const sub = db.subjects.find(s => s.id === att.subject_id);
    const marker = db.users.find(u => u.id === att.marked_by);
    return {
      ...att,
      student_name: studentUser ? `${studentUser.first_name} ${studentUser.last_name}` : '',
      roll_number: studentProfile ? studentProfile.roll_number : '',
      subject_name: sub ? sub.name : '',
      subject_code: sub ? sub.code : '',
      marked_by_name: marker ? `${marker.first_name} ${marker.last_name}` : ''
    };
  });

  // Students can ONLY view their own attendance
  if (user.role === 'STUDENT') {
    results = results.filter(a => a.student_id === user.id);
  } else if (studentParam) {
    results = results.filter(a => a.student_id === Number(studentParam));
  }

  if (subjectParam) {
    results = results.filter(a => a.subject_id === Number(subjectParam));
  }

  if (date) {
    results = results.filter(a => a.date === String(date));
  }

  return res.json(results);
});

// GET /api/attendance/student/ (Student view of subject-wise summary)
router.get('/student/', authenticateUser, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const db = getDB();

  // If faculty/admin is querying for a specific student via ?student_id=
  const targetStudentId = (user.role === 'STUDENT') ? user.id : Number(req.query.student_id || user.id);
  const studentProfile = db.student_profiles.find(sp => sp.user_id === targetStudentId);

  if (!studentProfile) {
    return res.status(404).json({ detail: 'Student profile not found' });
  }

  const enrolledSubjects = db.subjects.filter(s => s.department_id === studentProfile.department_id);

  const breakdown = enrolledSubjects.map(sub => {
    const records = db.attendance.filter(a => a.student_id === targetStudentId && a.subject_id === sub.id);
    const totalClasses = records.length;
    const presentClasses = records.filter(a => a.status === 'PRESENT').length;
    const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;
    return {
      subject_id: sub.id,
      subject_name: sub.name,
      subject_code: sub.code,
      present_classes: presentClasses,
      total_classes: totalClasses,
      attendance_percentage: percentage,
      is_warning: percentage < 75 && totalClasses > 0
    };
  });

  const totalPresent = breakdown.reduce((acc, b) => acc + b.present_classes, 0);
  const totalConducted = breakdown.reduce((acc, b) => acc + b.total_classes, 0);
  const overallPercentage = totalConducted > 0 ? Math.round((totalPresent / totalConducted) * 100) : 100;

  return res.json({
    student_id: targetStudentId,
    overall_percentage: overallPercentage,
    is_warning: overallPercentage < 75 && totalConducted > 0,
    total_conducted: totalConducted,
    total_attended: totalPresent,
    subjects: breakdown
  });
});

// GET /api/attendance/summary/
router.get('/summary/', authenticateUser, requireRole('FACULTY', 'ADMIN'), (req: AuthRequest, res: Response) => {
  const db = getDB();

  const subjectStats = db.subjects.map(sub => {
    const records = db.attendance.filter(a => a.subject_id === sub.id);
    const total = records.length;
    const present = records.filter(a => a.status === 'PRESENT').length;
    const avg = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      subject_id: sub.id,
      subject_name: sub.name,
      subject_code: sub.code,
      total_records: total,
      present_count: present,
      average_percentage: avg
    };
  });

  const allRecords = db.attendance;
  const overallPresent = allRecords.filter(a => a.status === 'PRESENT').length;
  const overallAvg = allRecords.length > 0 ? Math.round((overallPresent / allRecords.length) * 100) : 0;

  return res.json({
    overall_average: overallAvg,
    total_records: allRecords.length,
    subject_stats: subjectStats
  });
});

// POST /api/attendance/ and /api/attendance/mark/ (Faculty/Admin mark attendance, handles batch or single, prevents duplicate records!)
const markAttendanceHandler = (req: AuthRequest, res: Response) => {
  const { subject_id, subject, date, records, student_id, status } = req.body;
  const marker = req.user!;
  const db = getDB();

  const targetSubjectId = Number(subject_id || subject);

  if (!targetSubjectId || !date) {
    return res.status(400).json({ detail: 'Subject and date are required.' });
  }

  const now = new Date().toISOString();
  let nextId = db.attendance.length ? Math.max(...db.attendance.map(a => a.id)) + 1 : 1;
  const processedRecords: Attendance[] = [];

  if (Array.isArray(records)) {
    // Batch submission for a class roster
    for (const item of records) {
      const sId = Number(item.student_id);
      if (!sId) continue;

      const attStatus = String(item.status).toUpperCase() === 'PRESENT' ? 'PRESENT' : 'ABSENT';

      const existingIndex = db.attendance.findIndex(
        a => a.student_id === sId &&
             a.subject_id === targetSubjectId &&
             a.date === String(date)
      );

      if (existingIndex !== -1) {
        // Prevent duplicate - update existing record
        db.attendance[existingIndex].status = attStatus;
        db.attendance[existingIndex].marked_by = marker.id;
        processedRecords.push(db.attendance[existingIndex]);
      } else {
        // Insert new record
        const newAtt: Attendance = {
          id: nextId++,
          student_id: sId,
          subject_id: targetSubjectId,
          date: String(date),
          status: attStatus,
          marked_by: marker.id,
          created_at: now
        };
        db.attendance.push(newAtt);
        processedRecords.push(newAtt);
      }
    }
  } else if (student_id) {
    // Single student attendance record
    const sId = Number(student_id);
    const attStatus = String(status).toUpperCase() === 'PRESENT' ? 'PRESENT' : 'ABSENT';

    const existingIndex = db.attendance.findIndex(
      a => a.student_id === sId &&
           a.subject_id === targetSubjectId &&
           a.date === String(date)
    );

    if (existingIndex !== -1) {
      db.attendance[existingIndex].status = attStatus;
      db.attendance[existingIndex].marked_by = marker.id;
      processedRecords.push(db.attendance[existingIndex]);
    } else {
      const newAtt: Attendance = {
        id: nextId++,
        student_id: sId,
        subject_id: targetSubjectId,
        date: String(date),
        status: attStatus,
        marked_by: marker.id,
        created_at: now
      };
      db.attendance.push(newAtt);
      processedRecords.push(newAtt);
    }
  } else {
    return res.status(400).json({ detail: 'Either records array or student_id is required.' });
  }

  saveDB(db);
  return res.status(201).json({
    message: 'Attendance saved successfully.',
    saved_count: processedRecords.length,
    records: processedRecords
  });
};

router.post('/', authenticateUser, requireRole('FACULTY', 'ADMIN'), markAttendanceHandler);
router.post('/mark', authenticateUser, requireRole('FACULTY', 'ADMIN'), markAttendanceHandler);
router.post('/mark/', authenticateUser, requireRole('FACULTY', 'ADMIN'), markAttendanceHandler);

// PUT /api/attendance/:id/
router.put('/:id', authenticateUser, requireRole('FACULTY', 'ADMIN'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const db = getDB();

  const index = db.attendance.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Attendance record not found.' });
  }

  if (status) {
    db.attendance[index].status = status === 'PRESENT' ? 'PRESENT' : 'ABSENT';
  }
  db.attendance[index].marked_by = req.user!.id;

  saveDB(db);
  return res.json(db.attendance[index]);
});

export default router;
