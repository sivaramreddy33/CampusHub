import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/auth.js';
import studentRoutes from './server/routes/students.js';
import facultyRoutes from './server/routes/faculty.js';
import departmentRoutes from './server/routes/departments.js';
import subjectRoutes from './server/routes/subjects.js';
import attendanceRoutes from './server/routes/attendance.js';
import assignmentRoutes from './server/routes/assignments.js';
import submissionRoutes from './server/routes/submissions.js';
import announcementRoutes from './server/routes/announcements.js';
import complaintRoutes from './server/routes/complaints.js';
import dashboardRoutes from './server/routes/dashboard.js';
import { getDB } from './server/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize and seed database if not already loaded
  getDB();

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CampusHub REST API',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API Endpoints (matching Django REST Framework URLs)
  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/faculty', facultyRoutes);
  app.use('/api/departments', departmentRoutes);
  app.use('/api/subjects', subjectRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/submissions', submissionRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // Vite middleware in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CampusHub Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CampusHub Server Error]', err);
  process.exit(1);
});
