import { Router, Response } from 'express';
import { getDB, saveDB, Subject } from '../db.js';
import { authenticateUser, AuthRequest, requireRole } from '../auth.js';

const router = Router();

// GET /api/subjects/
router.get('/', (req, res) => {
  const { department, faculty } = req.query;
  const db = getDB();

  let results = db.subjects.map(sub => {
    const dept = db.departments.find(d => d.id === sub.department_id);
    const facultyUser = db.users.find(u => u.id === sub.faculty_id);
    return {
      ...sub,
      department_name: dept ? dept.name : '',
      department_code: dept ? dept.code : '',
      faculty_name: facultyUser ? `${facultyUser.first_name} ${facultyUser.last_name}` : 'Unassigned'
    };
  });

  if (department) {
    results = results.filter(s => s.department_id === Number(department));
  }

  if (faculty) {
    results = results.filter(s => s.faculty_id === Number(faculty));
  }

  return res.json(results);
});

// POST /api/subjects/ (Admin only)
router.post('/', authenticateUser, requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  const { name, code, department_id, semester, faculty_id } = req.body;

  if (!name || !code || !department_id || !faculty_id) {
    return res.status(400).json({ detail: 'Name, code, department, and faculty are required.' });
  }

  const db = getDB();
  if (db.subjects.some(s => s.code.toLowerCase() === code.trim().toLowerCase())) {
    return res.status(400).json({ code: ['Subject code already exists.'] });
  }

  const newId = db.subjects.length ? Math.max(...db.subjects.map(s => s.id)) + 1 : 1;
  const newSubject: Subject = {
    id: newId,
    name: name.trim(),
    code: code.trim().toUpperCase(),
    department_id: Number(department_id),
    semester: Number(semester) || 1,
    faculty_id: Number(faculty_id)
  };

  db.subjects.push(newSubject);
  saveDB(db);

  const dept = db.departments.find(d => d.id === newSubject.department_id);
  const facultyUser = db.users.find(u => u.id === newSubject.faculty_id);

  return res.status(201).json({
    ...newSubject,
    department_name: dept ? dept.name : '',
    department_code: dept ? dept.code : '',
    faculty_name: facultyUser ? `${facultyUser.first_name} ${facultyUser.last_name}` : ''
  });
});

// PUT /api/subjects/:id/ (Admin only)
router.put('/:id', authenticateUser, requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { name, code, department_id, semester, faculty_id } = req.body;
  const db = getDB();

  const index = db.subjects.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Subject not found' });
  }

  if (name) db.subjects[index].name = name.trim();
  if (code) db.subjects[index].code = code.trim().toUpperCase();
  if (department_id) db.subjects[index].department_id = Number(department_id);
  if (semester) db.subjects[index].semester = Number(semester);
  if (faculty_id) db.subjects[index].faculty_id = Number(faculty_id);

  saveDB(db);

  const updated = db.subjects[index];
  const dept = db.departments.find(d => d.id === updated.department_id);
  const facultyUser = db.users.find(u => u.id === updated.faculty_id);

  return res.json({
    ...updated,
    department_name: dept ? dept.name : '',
    department_code: dept ? dept.code : '',
    faculty_name: facultyUser ? `${facultyUser.first_name} ${facultyUser.last_name}` : ''
  });
});

// DELETE /api/subjects/:id/ (Admin only)
router.delete('/:id', authenticateUser, requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const db = getDB();

  const index = db.subjects.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Subject not found' });
  }

  db.subjects.splice(index, 1);
  saveDB(db);

  return res.status(204).send();
});

export default router;
