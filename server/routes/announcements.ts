import { Router, Response } from 'express';
import { getDB, saveDB, Announcement } from '../db.js';
import { authenticateUser, AuthRequest, requireRole } from '../auth.js';

const router = Router();

// GET /api/announcements/
router.get('/', authenticateUser, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const db = getDB();

  let results = db.announcements.map(ann => {
    const creator = db.users.find(u => u.id === ann.created_by);
    const dept = ann.department_id ? db.departments.find(d => d.id === ann.department_id) : null;
    return {
      ...ann,
      creator_name: creator ? `${creator.first_name} ${creator.last_name}` : 'Staff',
      department_name: dept ? dept.name : 'All Departments (General)',
      department_code: dept ? dept.code : 'ALL'
    };
  });

  // Students see announcements for their department + general announcements
  if (user.role === 'STUDENT') {
    const profile = db.student_profiles.find(sp => sp.user_id === user.id);
    const studentDeptId = profile ? profile.department_id : null;
    results = results.filter(a => !a.department_id || a.department_id === studentDeptId);
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return res.json(results);
});

// POST /api/announcements/ (Faculty/Admin create)
router.post('/', authenticateUser, requireRole('FACULTY', 'ADMIN'), (req: AuthRequest, res: Response) => {
  const { title, content, department_id } = req.body;
  const user = req.user!;
  const db = getDB();

  if (!title || !content) {
    return res.status(400).json({ detail: 'Title and content are required.' });
  }

  const newId = db.announcements.length ? Math.max(...db.announcements.map(a => a.id)) + 1 : 1;
  const now = new Date().toISOString();

  const newAnn: Announcement = {
    id: newId,
    title: title.trim(),
    content: content.trim(),
    created_by: user.id,
    department_id: department_id ? Number(department_id) : null,
    created_at: now,
    updated_at: now
  };

  db.announcements.push(newAnn);
  saveDB(db);

  const creator = db.users.find(u => u.id === newAnn.created_by);
  const dept = newAnn.department_id ? db.departments.find(d => d.id === newAnn.department_id) : null;

  return res.status(201).json({
    ...newAnn,
    creator_name: creator ? `${creator.first_name} ${creator.last_name}` : '',
    department_name: dept ? dept.name : 'All Departments (General)',
    department_code: dept ? dept.code : 'ALL'
  });
});

// PUT /api/announcements/:id/ (Admin or creator)
router.put('/:id', authenticateUser, requireRole('FACULTY', 'ADMIN'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { title, content, department_id } = req.body;
  const db = getDB();

  const index = db.announcements.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Announcement not found.' });
  }

  if (title) db.announcements[index].title = title.trim();
  if (content) db.announcements[index].content = content.trim();
  if (department_id !== undefined) db.announcements[index].department_id = department_id ? Number(department_id) : null;
  db.announcements[index].updated_at = new Date().toISOString();

  saveDB(db);

  return res.json(db.announcements[index]);
});

// DELETE /api/announcements/:id/ (Admin or creator)
router.delete('/:id', authenticateUser, requireRole('FACULTY', 'ADMIN'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const db = getDB();

  const index = db.announcements.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ detail: 'Announcement not found.' });
  }

  db.announcements.splice(index, 1);
  saveDB(db);

  return res.status(204).send();
});

export default router;
