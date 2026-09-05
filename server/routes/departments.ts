import { Router, Response } from 'express';
import { getDB, saveDB, Department } from '../db.js';
import { authenticateUser, AuthRequest, requireRole } from '../auth.js';

const router = Router();

// GET /api/departments/
router.get('/', (req, res) => {
  const db = getDB();
  const departmentsWithCounts = db.departments.map(dept => {
    const studentCount = db.student_profiles.filter(sp => sp.department_id === dept.id).length;
    const facultyCount = db.faculty_profiles.filter(fp => fp.department_id === dept.id).length;
    const subjectCount = db.subjects.filter(s => s.department_id === dept.id).length;
    return {
      ...dept,
      student_count: studentCount,
      faculty_count: facultyCount,
      subject_count: subjectCount
    };
  });
  return res.json(departmentsWithCounts);
});

// POST /api/departments/ (Admin only)
router.post('/', authenticateUser, requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  const { name, code } = req.body;
  if (!name || !code) {
    return res.status(400).json({ detail: 'Department name and code are required.' });
  }

  const db = getDB();
  if (db.departments.some(d => d.code.toLowerCase() === code.trim().toLowerCase())) {
    return res.status(400).json({ code: ['Department code already exists.'] });
  }

  const newId = db.departments.length ? Math.max(...db.departments.map(d => d.id)) + 1 : 1;
  const newDept: Department = {
    id: newId,
    name: name.trim(),
    code: code.trim().toUpperCase(),
    created_at: new Date().toISOString()
  };

  db.departments.push(newDept);
  saveDB(db);

  return res.status(201).json(newDept);
});

// PUT /api/departments/:id/ (Admin only)
router.put('/:id', authenticateUser, requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { name, code } = req.body;
  const db = getDB();

  const index = db.departments.findIndex(d => d.id === id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Department not found' });
  }

  if (name) db.departments[index].name = name.trim();
  if (code) db.departments[index].code = code.trim().toUpperCase();

  saveDB(db);
  return res.json(db.departments[index]);
});

// DELETE /api/departments/:id/ (Admin only)
router.delete('/:id', authenticateUser, requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const db = getDB();

  const index = db.departments.findIndex(d => d.id === id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Department not found' });
  }

  // Check if students or subjects are associated
  const hasStudents = db.student_profiles.some(sp => sp.department_id === id);
  if (hasStudents) {
    return res.status(400).json({ detail: 'Cannot delete department with enrolled students.' });
  }

  db.departments.splice(index, 1);
  saveDB(db);

  return res.status(204).send();
});

export default router;
