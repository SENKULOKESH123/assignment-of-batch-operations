import express from 'express';
import cors from 'cors';
import batchesRouter from './routes/batches.js';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'Batch API is running' }));
app.use('/api/batches', batchesRouter);
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

export default app;
