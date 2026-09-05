import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDB, User } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campushub-super-secret-jwt-key-2026';
const ACCESS_TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateTokens(user: User) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  const access = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refresh = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

  return { access, refresh };
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ detail: 'Given token not valid for any token type' });
  }

  const db = getDB();
  const user = db.users.find(u => u.id === decoded.id);

  if (!user) {
    return res.status(401).json({ detail: 'User not found.' });
  }

  req.user = user;
  next();
}

export function requireRole(...allowedRoles: Array<'STUDENT' | 'FACULTY' | 'ADMIN'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ detail: 'You do not have permission to perform this action.' });
    }

    next();
  };
}
