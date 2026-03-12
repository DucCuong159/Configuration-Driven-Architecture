/**
 * CDA Backend - Express Server
 * Mock API server for the CDA Asset Management System.
 */
import express from 'express';
import cors from 'cors';
import { configRoutes } from './routes/config';
import { assetRoutes } from './routes/assets';
import { activityRoutes } from './routes/activities';
import { reviewRoutes } from './routes/reviews';

const app = express();
const PORT = 3001;

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ──────────────────────────────────────────────
app.use('/api/config', configRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 CDA Backend running on http://localhost:${PORT}`);
  console.log(`   API endpoints:`);
  console.log(`   - GET  /api/config/asset-types`);
  console.log(`   - GET  /api/assets`);
  console.log(`   - POST /api/assets`);
  console.log(`   - GET  /api/activities`);
  console.log(`   - GET  /api/reviews`);
  console.log(`   - GET  /api/health\n`);
});

export default app;
