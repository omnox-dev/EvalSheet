import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from '../server/routes/api.js';
import { initDB } from '../server/db/index.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Ensure database schema is initialized on serverless execution
let dbInitialized = false;
let dbInitPromise = null;

app.use(async (req, res, next) => {
  if (!dbInitialized) {
    if (!dbInitPromise) {
      dbInitPromise = initDB()
        .then(() => {
          dbInitialized = true;
        })
        .catch((err) => {
          console.error('Database initialization error:', err);
          dbInitPromise = null;
        });
    }
    await dbInitPromise;
  }
  next();
});

// Mount API routes
app.use('/api', apiRouter);

export default app;
