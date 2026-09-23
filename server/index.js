import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { initDB } from './db/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Serve static frontend in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  // If API route not found
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  // Otherwise serve React SPA
  res.sendFile(path.join(distPath, 'index.html'));
});

// Bootstrap
async function startServer() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 EvalSheet Server running on http://localhost:${PORT}`);
    console.log(`⚡ API ready at http://localhost:${PORT}/api`);
    console.log(`===============================================`);
  });
}

startServer();
