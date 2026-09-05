import { Router, Response } from 'express';
import { getDB, saveDB, Assignment } from '../db.js';
import { authenticateUser, AuthRequest, requireRole } from '../auth.js';

const router = Router();

// GET /api/assignments/
router.get('/', authenticateUser, (req: AuthRequest, res: Response) => {
  const { subject, faculty } = req.query;
  const user = req.user!;
  const db = getDB();

  let results = db.assignments.map(assign => {
    const sub = db.subjects.find(s => s.id === assign.subject_id);
    const facUser = db.users.find(u => u.id === assign.faculty_id);
    const dept = sub ? db.departments.find(d => d.id === sub.department_id) : null;
    const submissionCount = db.submissions.filter(s => s.assignment_id === assign.id).length;
    
    // Check if the current student has submitted
    let studentSubmission = null;
    if (user.role === 'STUDENT') {
      studentSubmission = db.submissions.find(
        s => s.assignment_id === assign.id && s.student_id === user.id
      ) || null;
    }

    return {
      ...assign,
      subject_name: sub ? sub.name : '',
      subject_code: sub ? sub.code : '',
      department_name: dept ? dept.name : '',
      department_id: sub ? sub.department_id : null,
      faculty_name: facUser ? `${facUser.first_name} ${facUser.last_name}` : '',
      total_submissions: submissionCount,
      student_submission: studentSubmission,
      is_past_deadline: new Date() > new Date(assign.deadline)
    };
  });

  // Filter for student department
  if (user.role === 'STUDENT') {
    const profile = db.student_profiles.find(sp => sp.user_id === user.id);
    if (profile) {
      results = results.filter(a => a.department_id === profile.department_id);
    }
  }

  if (subject) {
    results = results.filter(a => a.subject_id === Number(subject));
  }

  if (faculty) {
    results = results.filter(a => a.faculty_id === Number(faculty));
  }

  return res.json(results);
});

// GET /api/assignments/:id/
router.get('/:id', authenticateUser, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const user = req.user!;
  const db = getDB();

  const assign = db.assignments.find(a => a.id === id);
  if (!assign) {
    return res.status(404).json({ detail: 'Assignment not found' });
  }

  const sub = db.subjects.find(s => s.id === assign.subject_id);
  const facUser = db.users.find(u => u.id === assign.faculty_id);
  const dept = sub ? db.departments.find(d => d.id === sub.department_id) : null;
  const submissions = db.submissions.filter(s => s.assignment_id === assign.id);

  let studentSubmission = null;
  if (user.role === 'STUDENT') {
    studentSubmission = submissions.find(s => s.student_id === user.id) || null;
  }

  return res.json({
    ...assign,
    subject_name: sub ? sub.name : '',
    subject_code: sub ? sub.code : '',
    department_name: dept ? dept.name : '',
    faculty_name: facUser ? `${facUser.first_name} ${facUser.last_name}` : '',
    submissions_count: submissions.length,
    student_submission: studentSubmission,
    is_past_deadline: new Date() > new Date(assign.deadline)
  });
});

// POST /api/assignments/ (Faculty/Admin create)
router.post('/', authenticateUser, requireRole('FACULTY', 'ADMIN'), (req: AuthRequest, res: Response) => {
  const { title, description, subject_id, deadline } = req.body;
  const user = req.user!;
  const db = getDB();

  if (!title || !description || !subject_id || !deadline) {
    return res.status(400).json({ detail: 'Title, description, subject, and deadline are required.' });
  }

  const newId = db.assignments.length ? Math.max(...db.assignments.map(a => a.id)) + 1 : 1;
  const now = new Date().toISOString();

  const newAssign: Assignment = {
    id: newId,
    title: title.trim(),
    description: description.trim(),
    subject_id: Number(subject_id),
    faculty_id: user.id,
    deadline: new Date(deadline).toISOString(),
    created_at: now,
    updated_at: now
  };

  db.assignments.push(newAssign);
  saveDB(db);

  const sub = db.subjects.find(s => s.id === newAssign.subject_id);
  return res.status(201).json({
    ...newAssign,
    subject_name: sub ? sub.name : '',
    subject_code: sub ? sub.code : ''
  });
});

// PUT /api/assignments/:id/ (Faculty/Admin edit)
router.put('/:id', authenticateUser, requireRole('FACULTY', 'ADMIN'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { title, description, subject_id, deadline } = req.body;
  const db = getDB();

  const index = db.assignments.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Assignment not found' });
  }

  if (title) db.assignments[index].title = title.trim();
  if (description) db.assignments[index].description = description.trim();
  if (subject_id) db.assignments[index].subject_id = Number(subject_id);
  if (deadline) db.assignments[index].deadline = new Date(deadline).toISOString();
  db.assignments[index].updated_at = new Date().toISOString();

  saveDB(db);

  return res.json(db.assignments[index]);
});

// DELETE /api/assignments/:id/ (Faculty/Admin delete)
router.delete('/:id', authenticateUser, requireRole('FACULTY', 'ADMIN'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const db = getDB();

  const index = db.assignments.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Assignment not found' });
  }

  // Also remove associated submissions
  db.assignments.splice(index, 1);
  db.submissions = db.submissions.filter(s => s.assignment_id !== id);

  saveDB(db);
  return res.status(204).send();
});

export default router;
