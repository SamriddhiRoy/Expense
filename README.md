## Minimal Expense Tracker

A small, production‑minded expense tracker focused on **data correctness**, **idempotency**, and **money handling**, not on feature breadth.

### Tech Stack
- **Backend**: Node.js, Express, SQLite (`better-sqlite3`)
- **Frontend**: React (Vite), Fetch API

### Running the app
- **Backend**
  - `cd backend`
  - `npm install`
  - `npm start` (runs on `http://localhost:3000`)
- **Frontend**
  - `cd frontend`
  - `npm install`
  - `npm run dev` (runs on `http://localhost:5173`, proxied to the backend)

The frontend is configured to call the backend at `http://localhost:3000`.

### Tests
- **Backend**
  - `cd backend`
  - `npm test`

The backend includes a small number of targeted tests focused on:
- Idempotent behavior of `POST /expenses`
- Correct filtering and sorting in `GET /expenses`

### API
- **POST `/expenses`**
  - Body: `{ idempotencyKey, amount, category, description, date }`
  - Idempotent: same `idempotencyKey` returns the existing expense instead of inserting a duplicate.
- **GET `/expenses`**
  - Optional query params:
    - `category` – filter by category
    - `sort=date_desc` – sort by date, newest first

### Data model & persistence choice
You can choose any reasonable persistence mechanism (e.g., in‑memory store, JSON file, SQLite, relational DB, no‑SQL DB).  
This project uses **SQLite** via `better-sqlite3` because:
- It is file‑based and zero‑config, which fits a small personal tool.
- It has real transaction support and good concurrency semantics, which is safer than a JSON file or pure in‑memory store for money data.
- It keeps the deployment story simple (no external DB server), while still being a production‑proven relational database.

SQLite table:

```sql
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  amount_paise INTEGER NOT NULL CHECK(amount_paise >= 0),
  category TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

Amounts are stored as **integer paise**, not floats, to avoid rounding/precision errors.

### Key design decisions
- **Idempotent writes**: The client generates a UUID `idempotencyKey` for each submission; the backend enforces `UNIQUE(idempotency_key)` and a lookup‑before‑insert. This makes retries, double‑clicks, and refreshes **safe**.
- **Integer money**: Store `amount_paise` as an integer and only convert to rupees at the edges (UI / JSON), to avoid float issues.
- **Server‑side sorting & filtering**: `/expenses` handles `category` and `sort` on the backend so the source of truth is the database, not client state.
- **Simple, explicit error handling**: both form and list have loading/error states; failures are surfaced instead of silently ignored.
- **Small but tested**: backend has a couple of targeted tests for idempotent POST and filtered/sorted GET using an in‑memory SQLite DB.

### Edge cases handled
- Double submission and network retries (idempotent POST)
- Page refresh after submit
- Floating‑point precision errors for money (use of integer paise)
- Validation failures for missing or invalid input

### Trade‑offs due to timebox
- **Minimal feature set**: focused only on creating and listing expenses with basic filters and totals; no edits, deletes, or pagination.
- **No authentication / multi‑user support**: treated as a single‑user personal tool to keep the scope tight.
- **No advanced UI/UX or charts**: styling is intentionally simple; time was spent on correctness and resilience instead of visual polish.
- **Limited testing**: only a few high‑value backend tests were added (idempotency and query behavior), rather than full coverage or E2E tests.

### Intentionally not implemented (for now)
- User accounts, sessions, or permissions
- Editing or deleting existing expenses
- Pagination and large‑dataset performance features
- Reporting/analytics dashboards or charts
- Production deployment scripts/infra (Docker, CI/CD, etc.)

These can be added later, but they do not materially change the core goal of this exercise: a **small, correct, retry‑safe expense tracker** with sound money handling.

