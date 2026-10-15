import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { getDbPool, testDbConnection } from './db';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API 1: Health check & MySQL status
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbStatus = await testDbConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mysql: dbStatus,
  });
});

// API 2: Get Patients
app.get('/api/patients', async (_req: Request, res: Response) => {
  try {
    const pool = getDbPool();
    const [rows] = await pool.query('SELECT * FROM patients ORDER BY visit_date DESC, created_at DESC');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API 3: Create Patient
app.post('/api/patients', async (req: Request, res: Response) => {
  try {
    const pool = getDbPool();
    const p = req.body;
    const query = `
      INSERT INTO patients 
      (id, code, name, patient_type, no_rm, service, dob, gender, phone, address, visit_date, session_name, time_slot, complaint, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(query, [
      p.id,
      p.code,
      p.name,
      p.patientType || 'Baru',
      p.noRM || '-',
      p.service,
      p.dob || null,
      p.gender || 'Laki-laki',
      p.phone,
      p.address || '',
      p.visitDate,
      p.sessionName,
      p.timeSlot,
      p.complaint || '',
      p.status || 'Menunggu',
    ]);
    res.json({ success: true, id: p.id, code: p.code });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API 4: Update Patient Status
app.put('/api/patients/:id/status', async (req: Request, res: Response) => {
  try {
    const pool = getDbPool();
    const { status } = req.body;
    await pool.query('UPDATE patients SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, id: req.params.id, status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API 5: Get Patient Accounts
app.get('/api/patient-accounts', async (_req: Request, res: Response) => {
  try {
    const pool = getDbPool();
    const [rows] = await pool.query('SELECT id, name, phone, patient_type, no_rm, dob, gender, address, created_at FROM patient_accounts');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API 6: Register Patient Account
app.post('/api/patient-accounts', async (req: Request, res: Response) => {
  try {
    const pool = getDbPool();
    const acc = req.body;
    const query = `
      INSERT INTO patient_accounts 
      (id, name, password, phone, patient_type, no_rm, dob, gender, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(query, [
      acc.id,
      acc.name,
      acc.password,
      acc.phone,
      acc.patientType || 'Baru',
      acc.noRM || '-',
      acc.dob || null,
      acc.gender || 'Laki-laki',
      acc.address || '',
    ]);
    res.json({ success: true, id: acc.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API 7: Get & Update Clinic Status
app.get('/api/clinic-status', async (_req: Request, res: Response) => {
  try {
    const pool = getDbPool();
    const [rows]: any = await pool.query('SELECT * FROM clinic_status ORDER BY id DESC LIMIT 1');
    if (rows && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({ isOpen: 1, mode: 'auto', reason: '', reopenEstimate: '' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clinic-status', async (req: Request, res: Response) => {
  try {
    const pool = getDbPool();
    const { isOpen, mode, reason, reopenEstimate } = req.body;
    const query = `
      INSERT INTO clinic_status (id, is_open, mode, reason, reopen_estimate)
      VALUES (1, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        is_open = VALUES(is_open),
        mode = VALUES(mode),
        reason = VALUES(reason),
        reopen_estimate = VALUES(reopen_estimate)
    `;
    await pool.query(query, [isOpen ? 1 : 0, mode || 'auto', reason || '', reopenEstimate || '']);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server with Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server Klinik H.APUD berjalan di http://localhost:${PORT}`);
    console.log(`📦 Database MySQL target: ${process.env.DB_NAME || 'klinik_hapud'}`);
  });
}

startServer();
