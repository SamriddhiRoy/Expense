import { randomUUID } from 'crypto';

export function createExpenseRoutes(db) {
  const router = {
    post: (req, res) => {
      const { idempotencyKey, amount, category, description, date } = req.body;

      if (!idempotencyKey || amount < 0 || !category || !date) {
        return res.status(400).json({ error: 'Invalid input' });
      }

      const existing = db
        .prepare('SELECT * FROM expenses WHERE idempotency_key = ?')
        .get(idempotencyKey);

      if (existing) return res.json(existing);

      const expense = {
        id: randomUUID(),
        idempotency_key: idempotencyKey,
        amount_paise: Math.round(amount * 100),
        category,
        description,
        date,
        created_at: new Date().toISOString(),
      };

      db.prepare(`
        INSERT INTO expenses VALUES (@id, @idempotency_key, @amount_paise, @category, @description, @date, @created_at)
      `).run(expense);

      res.status(201).json(expense);
    },

    get: (req, res) => {
      const { category, sort } = req.query;

      let query = 'SELECT * FROM expenses';
      const params = [];

      if (category) {
        query += ' WHERE category = ?';
        params.push(category);
      }

      if (sort === 'date_desc') {
        query += ' ORDER BY date DESC';
      }

      const rows = db.prepare(query).all(...params);
      res.json(rows);
    },
  };

  return router;
}
