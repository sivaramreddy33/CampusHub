import { Router, Response } from 'express';
import { getDB, saveDB, Submission } from '../db.js';
import { authenticateUser, AuthRequest, requireRole } from '../auth.js';

const router = Router();

// GET /api/submissions/
router.get('/', authenticateUser, (req: AuthRequest, res: Response) => {
  const { assignment, student } = req.query;
  const user = req.user!;
  const db = getDB();

  let results = db.submissions.map(sub => {
    const assign = db.assignments.find(a => a.id === sub.assignment_id);
    const studentUser = db.users.find(u => u.id === sub.student_id);
    const studentProfile = db.student_profiles.find(sp => sp.user_id === sub.student_id);
    const subject = assign ? db.subjects.find(s => s.id === assign.subject_id) : null;
    return {
      ...sub,
      assignment_title: assign ? assign.title : '',
      assignment_deadline: assign ? assign.deadline : '',
      subject_name: subject ? subject.name : '',
      student_name: studentUser ? `${studentUser.first_name} ${studentUser.last_name}` : '',
      student_email: studentUser ? studentUser.email : '',
      roll_number: studentProfile ? studentProfile.roll_number : ''
    };
  });

  // Role restrictions
  if (user.role === 'STUDENT') {
    results = results.filter(s => s.student_id === user.id);
  } else if (student) {
    results = results.filter(s => s.student_id === Number(student));
  }

  if (assignment) {
    results = results.filter(s => s.assignment_id === Number(assignment));
  }

  return res.json(results);
});

// POST /api/submissions/ (Student submit assignment)
router.post('/', authenticateUser, requireRole('STUDENT'), (req: AuthRequest, res: Response) => {
  const { assignment_id, submission_text, submission_file } = req.body;
  const student = req.user!;
  const db = getDB();

  if (!assignment_id || !submission_text) {
    return res.status(400).json({ detail: 'Assignment ID and submission text/notes are required.' });
  }

  const assign = db.assignments.find(a => a.id === Number(assignment_id));
  if (!assign) {
    return res.status(404).json({ detail: 'Assignment not found.' });
  }

  // Check if student already submitted - allow resubmission / update if not yet graded
  const existingIndex = db.submissions.findIndex(
    s => s.assignment_id === assign.id && s.student_id === student.id
  );

  const now = new Date();
  const deadlineDate = new Date(assign.deadline);
  const isLate = now > deadlineDate;
  const status = isLate ? 'LATE' : 'SUBMITTED';

  if (existingIndex !== -1) {
    // Update existing submission
    db.submissions[existingIndex].submission_text = submission_text.trim();
    if (submission_file) db.submissions[existingIndex].submission_file = submission_file;
    db.submissions[existingIndex].submitted_at = now.toISOString();
    db.submissions[existingIndex].status = status;
    saveDB(db);
    return res.json({
      ...db.submissions[existingIndex],
      message: 'Submission updated successfully.'
    });
  }

  const newId = db.submissions.length ? Math.max(...db.submissions.map(s => s.id)) + 1 : 1;
  const newSubmission: Submission = {
    id: newId,
    assignment_id: assign.id,
    student_id: student.id,
    submission_file: submission_file || 'assignment_submission.pdf',
    submission_text: submission_text.trim(),
    submitted_at: now.toISOString(),
    marks: null,
    feedback: undefined,
    status
  };

  db.submissions.push(newSubmission);
  saveDB(db);

  return res.status(201).json({
    ...newSubmission,
    message: isLate ? 'Assignment submitted late after deadline.' : 'Assignment submitted successfully.'
  });
});

// GET /api/submissions/:id/
router.get('/:id', authenticateUser, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const db = getDB();
  const sub = db.submissions.find(s => s.id === id);

  if (!sub) {
    return res.status(404).json({ detail: 'Submission not found' });
  }

  const assign = db.assignments.find(a => a.id === sub.assignment_id);
  const studentUser = db.users.find(u => u.id === sub.student_id);
  const studentProfile = db.student_profiles.find(sp => sp.user_id === sub.student_id);

  return res.json({
    ...sub,
    assignment_title: assign ? assign.title : '',
    student_name: studentUser ? `${studentUser.first_name} ${studentUser.last_name}` : '',
    roll_number: studentProfile ? studentProfile.roll_number : ''
  });
});

// PUT /api/submissions/:id/grade/ (Faculty grade submission)
router.put('/:id/grade/', authenticateUser, requireRole('FACULTY', 'ADMIN'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { marks, feedback } = req.body;
  const db = getDB();

  const index = db.submissions.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Submission not found.' });
  }

  if (marks === undefined || marks === null || isNaN(Number(marks))) {
    return res.status(400).json({ detail: 'Valid marks (0-100) are required.' });
  }

  const numericMarks = Math.max(0, Math.min(100, Number(marks)));
  db.submissions[index].marks = numericMarks;
  db.submissions[index].feedback = feedback ? String(feedback).trim() : 'Evaluated and marked.';
  db.submissions[index].status = 'GRADED';

  saveDB(db);

  return res.json({
    ...db.submissions[index],
    message: 'Submission graded successfully.'
  });
});

export default router;
