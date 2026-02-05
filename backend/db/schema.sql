CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  amount_paise INTEGER NOT NULL CHECK(amount_paise >= 0),
  category TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL
);
