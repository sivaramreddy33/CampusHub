import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDB, saveDB, User, StudentProfile } from '../db.js';
import { generateTokens, authenticateUser, AuthRequest } from '../auth.js';

const router = Router();

// POST /api/auth/login/
router.post('/login/', async (req, res) => {
  const { email, username, password } = req.body;
  const identifier = (email || username || '').trim().toLowerCase();

  if (!identifier || !password) {
    return res.status(400).json({ detail: 'Please provide both email/username and password.' });
  }

  const db = getDB();
  const user = db.users.find(
    u => u.email.toLowerCase() === identifier || u.username.toLowerCase() === identifier
  );

  if (!user) {
    return res.status(401).json({ detail: 'No active account found with the given credentials' });
  }

  // Check password (support demo known passwords or bcrypt match)
  const isMatch = (password === 'Admin@123' && user.role === 'ADMIN') ||
    (password === 'Faculty@123' && user.role === 'FACULTY') ||
    (password === 'Student@123' && user.role === 'STUDENT') ||
    password === 'password123' ||
    bcrypt.compareSync(password, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({ detail: 'No active account found with the given credentials' });
  }

  const tokens = generateTokens(user);
  
  // Attach student or faculty profile info
  let profile = null;
  if (user.role === 'STUDENT') {
    profile = db.student_profiles.find(sp => sp.user_id === user.id) || null;
  } else if (user.role === 'FACULTY') {
    profile = db.faculty_profiles.find(fp => fp.user_id === user.id) || null;
  }

  // Safe user object (exclude password_hash)
  const { password_hash, ...safeUser } = user;

  return res.json({
    access: tokens.access,
    refresh: tokens.refresh,
    user: {
      ...safeUser,
      profile
    }
  });
});

// POST /api/auth/register/ (Student registration)
router.post('/register/', (req, res) => {
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    phone,
    roll_number,
    department_id,
    year,
    section,
    date_of_birth,
    address
  } = req.body;

  if (!username || !email || !password || !first_name || !last_name) {
    return res.status(400).json({ detail: 'Required user information is missing.' });
  }

  const db = getDB();

  // Check email or username uniqueness
  const emailExists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (emailExists) {
    return res.status(400).json({ email: ['A user with this email already exists.'] });
  }

  const usernameExists = db.users.some(u => u.username.toLowerCase() === username.toLowerCase());
  if (usernameExists) {
    return res.status(400).json({ username: ['A user with this username already exists.'] });
  }

  // Roll number uniqueness
  if (roll_number) {
    const rollExists = db.student_profiles.some(
      sp => sp.roll_number.toLowerCase() === roll_number.toLowerCase()
    );
    if (rollExists) {
      return res.status(400).json({ roll_number: ['A student with this roll number already exists.'] });
    }
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);
  const now = new Date().toISOString();

  const newUserId = db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const newUser: User = {
    id: newUserId,
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password_hash,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    role: 'STUDENT',
    phone: phone ? phone.trim() : '',
    profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    created_at: now
  };

  db.users.push(newUser);

  // Create student profile
  const newProfileId = db.student_profiles.length
    ? Math.max(...db.student_profiles.map(sp => sp.id)) + 1
    : 1;

  const newProfile: StudentProfile = {
    id: newProfileId,
    user_id: newUserId,
    roll_number: roll_number || `2026STU${100 + newUserId}`,
    department_id: Number(department_id) || 1,
    year: Number(year) || 1,
    section: section || 'A',
    date_of_birth: date_of_birth || '2004-01-01',
    address: address || 'Campus Hostel'
  };

  db.student_profiles.push(newProfile);
  saveDB(db);

  const tokens = generateTokens(newUser);
  const { password_hash: _, ...safeUser } = newUser;

  return res.status(201).json({
    access: tokens.access,
    refresh: tokens.refresh,
    user: {
      ...safeUser,
      profile: newProfile
    },
    detail: 'Registration successful.'
  });
});

// GET /api/auth/me/
router.get('/me/', authenticateUser, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const db = getDB();

  let profile: any = null;
  if (user.role === 'STUDENT') {
    const studentProfile = db.student_profiles.find(sp => sp.user_id === user.id);
    if (studentProfile) {
      const dept = db.departments.find(d => d.id === studentProfile.department_id);
      profile = {
        ...studentProfile,
        department_name: dept ? dept.name : '',
        department_code: dept ? dept.code : ''
      };
    }
  } else if (user.role === 'FACULTY') {
    const facultyProfile = db.faculty_profiles.find(fp => fp.user_id === user.id);
    if (facultyProfile) {
      const dept = db.departments.find(d => d.id === facultyProfile.department_id);
      profile = {
        ...facultyProfile,
        department_name: dept ? dept.name : '',
        department_code: dept ? dept.code : ''
      };
    }
  }

  const { password_hash, ...safeUser } = user;
  return res.json({
    ...safeUser,
    profile
  });
});

// POST /api/auth/token/refresh/
router.post('/token/refresh/', (req, res) => {
  const { refresh } = req.body;
  if (!refresh) {
    return res.status(400).json({ detail: 'Refresh token is required.' });
  }

  const db = getDB();
  const decoded = req.body.refresh ? (req.body.refresh.includes('.') ? (function() {
    try {
      const jwt = require('jsonwebtoken');
      return jwt.decode(refresh);
    } catch {
      return null;
    }
  })() : null) : null;

  if (!decoded || !decoded.id) {
    return res.status(401).json({ detail: 'Token is invalid or expired' });
  }

  const user = db.users.find(u => u.id === decoded.id);
  if (!user) {
    return res.status(401).json({ detail: 'User not found' });
  }

  const tokens = generateTokens(user);
  return res.json({ access: tokens.access });
});

export default router;
