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

const db = new Database('expenses.db');

// Initialize database schema
const schema = readFileSync(join(__dirname, 'db', 'schema.sql'), 'utf-8');
db.exec(schema);

// Setup routes
const expensesRoutes = createExpenseRoutes(db);
app.post('/expenses', expensesRoutes.post);
app.get('/expenses', expensesRoutes.get);

app.listen(3000, () => console.log('API running on :3000'));
