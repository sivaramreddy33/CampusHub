import { Router, Response } from 'express';
import { getDB, saveDB, Complaint } from '../db.js';
import { authenticateUser, AuthRequest, requireRole } from '../auth.js';

const router = Router();

// GET /api/complaints/
router.get('/', authenticateUser, (req: AuthRequest, res: Response) => {
  const { status, category } = req.query;
  const user = req.user!;
  const db = getDB();

  let results = db.complaints.map(comp => {
    const studentUser = db.users.find(u => u.id === comp.student_id);
    const studentProfile = db.student_profiles.find(sp => sp.user_id === comp.student_id);
    const dept = studentProfile ? db.departments.find(d => d.id === studentProfile.department_id) : null;
    return {
      ...comp,
      student_name: studentUser ? `${studentUser.first_name} ${studentUser.last_name}` : '',
      student_email: studentUser ? studentUser.email : '',
      roll_number: studentProfile ? studentProfile.roll_number : '',
      department_name: dept ? dept.name : '',
      department_id: studentProfile ? studentProfile.department_id : null
    };
  });

  // Students can only see their own complaints
  if (user.role === 'STUDENT') {
    results = results.filter(c => c.student_id === user.id);
  } else if (user.role === 'FACULTY') {
    // Faculty sees complaints from their department
    const profile = db.faculty_profiles.find(fp => fp.user_id === user.id);
    if (profile) {
      results = results.filter(c => c.department_id === profile.department_id);
    }
  }

  if (status) {
    results = results.filter(c => c.status === String(status));
  }

  if (category) {
    results = results.filter(c => c.category.toLowerCase() === String(category).toLowerCase());
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return res.json(results);
});

// POST /api/complaints/ (Students submit complaint)
router.post('/', authenticateUser, requireRole('STUDENT'), (req: AuthRequest, res: Response) => {
  const { category, subject, description } = req.body;
  const student = req.user!;
  const db = getDB();

  if (!category || !subject || !description) {
    return res.status(400).json({ detail: 'Category, subject, and description are required.' });
  }

  const newId = db.complaints.length ? Math.max(...db.complaints.map(c => c.id)) + 1 : 1;
  const now = new Date().toISOString();

  const newComplaint: Complaint = {
    id: newId,
    student_id: student.id,
    category: category,
    subject: subject.trim(),
    description: description.trim(),
    status: 'PENDING',
    admin_response: undefined,
    created_at: now,
    updated_at: now
  };

  db.complaints.push(newComplaint);
  saveDB(db);

  return res.status(201).json({
    ...newComplaint,
    message: 'Complaint submitted successfully. Ticket ID #' + newId
  });
});

// GET /api/complaints/:id/
router.get('/:id', authenticateUser, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const user = req.user!;
  const db = getDB();

  const comp = db.complaints.find(c => c.id === id);
  if (!comp) {
    return res.status(404).json({ detail: 'Complaint not found.' });
  }

  // Permission check
  if (user.role === 'STUDENT' && comp.student_id !== user.id) {
    return res.status(403).json({ detail: 'Permission denied.' });
  }

  const studentUser = db.users.find(u => u.id === comp.student_id);
  const studentProfile = db.student_profiles.find(sp => sp.user_id === comp.student_id);
  const dept = studentProfile ? db.departments.find(d => d.id === studentProfile.department_id) : null;

  return res.json({
    ...comp,
    student_name: studentUser ? `${studentUser.first_name} ${studentUser.last_name}` : '',
    roll_number: studentProfile ? studentProfile.roll_number : '',
    department_name: dept ? dept.name : ''
  });
});

// PUT /api/complaints/:id/status/ (Admin/Faculty update status and admin response)
router.put('/:id/status/', authenticateUser, requireRole('ADMIN', 'FACULTY'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { status, admin_response } = req.body;
  const db = getDB();

  const index = db.complaints.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Complaint not found.' });
  }

  if (status && ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].includes(status)) {
    db.complaints[index].status = status;
  }

  if (admin_response !== undefined) {
    db.complaints[index].admin_response = admin_response.trim();
  }

  db.complaints[index].updated_at = new Date().toISOString();
  saveDB(db);

  return res.json({
    ...db.complaints[index],
    message: 'Complaint updated successfully.'
  });
});

export default router;
