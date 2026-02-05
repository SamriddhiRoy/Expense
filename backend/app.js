import express from 'express';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createExpenseRoutes } from './routes/expenses.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// CORS middleware - allow requests from frontend
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow requests from Vercel deployments or localhost
  if (origin && (origin.includes('vercel.app') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const db = new Database('expenses.db');

// Initialize database schema
const schema = readFileSync(join(__dirname, 'db', 'schema.sql'), 'utf-8');
db.exec(schema);

// Setup routes
const expensesRoutes = createExpenseRoutes(db);
app.post('/expenses', expensesRoutes.post);
app.get('/expenses', expensesRoutes.get);

app.listen(3000, () => console.log('API running on :3000'));
