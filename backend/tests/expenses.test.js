import test from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createExpenseRoutes } from '../routes/expenses.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createDb() {
  const db = new Database(':memory:');
  const schema = readFileSync(
    join(__dirname, '../db/schema.sql'),
    'utf-8'
  );
  db.exec(schema);
  return db;
}

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
  };

  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  res.json = (data) => {
    res.body = data;
    return res;
  };

  return res;
}

test('POST /expenses is idempotent for same idempotencyKey', () => {
  const db = createDb();
  const routes = createExpenseRoutes(db);

  const req = {
    body: {
      idempotencyKey: 'same-key',
      amount: 12.34,
      category: 'Food',
      description: 'Lunch',
      date: '2026-02-01',
    },
  };

  const res1 = createMockRes();
  routes.post(req, res1);

  assert.equal(res1.statusCode, 201);
  assert.ok(res1.body.id);
  const firstId = res1.body.id;

  const countAfterFirst = db
    .prepare('SELECT COUNT(*) AS c FROM expenses')
    .get().c;
  assert.equal(countAfterFirst, 1);

  const res2 = createMockRes();
  routes.post(req, res2);

  assert.equal(res2.statusCode, 200);
  assert.equal(res2.body.id, firstId);

  const countAfterSecond = db
    .prepare('SELECT COUNT(*) AS c FROM expenses')
    .get().c;
  assert.equal(countAfterSecond, 1);
});

test('GET /expenses filters by category and sorts by date desc', () => {
  const db = createDb();
  const routes = createExpenseRoutes(db);

  // Two Food expenses with different dates
  routes.post(
    {
      body: {
        idempotencyKey: 'k1',
        amount: 10,
        category: 'Food',
        description: 'Breakfast',
        date: '2026-02-01',
      },
    },
    createMockRes()
  );

  routes.post(
    {
      body: {
        idempotencyKey: 'k2',
        amount: 20,
        category: 'Food',
        description: 'Dinner',
        date: '2026-02-03',
      },
    },
    createMockRes()
  );

  // One Travel expense (should be filtered out)
  routes.post(
    {
      body: {
        idempotencyKey: 'k3',
        amount: 30,
        category: 'Travel',
        description: 'Flight',
        date: '2026-02-02',
      },
    },
    createMockRes()
  );

  const getReq = {
    query: { category: 'Food', sort: 'date_desc' },
  };
  const getRes = createMockRes();

  routes.get(getReq, getRes);

  assert.equal(getRes.statusCode, 200);
  assert.equal(getRes.body.length, 2);
  assert.equal(getRes.body[0].date, '2026-02-03');
  assert.equal(getRes.body[1].date, '2026-02-01');
});

