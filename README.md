# FarmConnect

A web application connecting **farmers**, **buyers**, and **transporters** for produce sales and delivery. Farmers list produce, buyers place purchase requests, and transporters accept delivery jobs — with chat and ratings to keep everything connected.

## Tech stack

| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Backend  | Python 3, Flask, PyMySQL, Flask-CORS, Werkzeug     |
| Database | MySQL 8 (schema + demo seed in `backend/schema.sql`) |
| Frontend | React 18, Vite 5, Tailwind CSS, React Router, Axios |

```
backend/    Flask API (port 5000) + MySQL schema
frontend/   React + Vite app (port 5173)
docs/       All documentation (setup, architecture, testing, ...)
```

---

## Prerequisites

- **Python 3.9+** — check with `python --version`
- **MySQL 8.x** running locally (Workbench optional, any client works)
- **Node.js 18+** and **npm** — check with `node --version` / `npm --version`

---

## 1. Set up the database

Create and seed the database by running `backend/schema.sql` once. The file creates the `farmconnect` database, all 7 tables, and demo data for all three roles.

**Option A — MySQL Workbench / client:**

1. Open `backend/schema.sql` in a Query tab.
2. Run the whole file (it also does `DROP TABLE IF EXISTS` so it is safe to re-run).

**Option B — Python (no MySQL client needed):**

```bash
cd backend
pip install -r requirements.txt
python -c "import pymysql, re; conn = pymysql.connect(host='localhost', user='root', password='YOUR_MYSQL_PASSWORD', autocommit=True); cur = conn.cursor(); [cur.execute(s) for s in [x.strip() for x in re.split(r';', open('schema.sql', encoding='utf-8').read()) if x.strip() and not x.strip().upper().startswith(('CREATE DATABASE', 'USE '))]]; conn.close(); print('Database ready')"
```

> `schema.sql` runs `DROP TABLE IF EXISTS`, so re-running it resets the database to a clean demo state at any time.

---

## 2. Configure the backend

```bash
cd backend
```

Copy the example config and edit it to match your MySQL credentials:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password   # <- your MySQL root password
DB_NAME=farmconnect

SECRET_KEY=change-me-in-production
FLASK_ENV=development
FLASK_PORT=5000
```

Install dependencies and start the API:

```bash
pip install -r requirements.txt
python app.py
```

The backend runs at **http://localhost:5000** with a live API index at `http://localhost:5000/`.

> **Alternate seed**: instead of running `schema.sql`, you can start the server and hit `GET /api/seed` once — it inserts the same demo users/produce/requests using the credentials in `.env`.

---

## 3. Configure and run the frontend

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**.

Optional: if your backend is not on `localhost:5000`, create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Demo accounts

| Role        | Email                       | Password   |
| ----------- | --------------------------- | ---------- |
| Farmer      | farmer@farmconnect.com      | `password` |
| Buyer       | buyer@farmconnect.com       | `password` |
| Transporter | transporter@farmconnect.com | `password` |

Log in at **http://localhost:5173** with any of these. You can also **register a new account** from the "Sign up" link on the login page (role: Farmer, Buyer, or Transporter).

### Registration password rules

New passwords must contain at least:
- 8 characters
- one uppercase letter
- one lowercase letter
- one digit

---

## 5. Run the backend test suite

With the backend running on `localhost:5000`, run the end-to-end API test suite from a third terminal:

```bash
python backend_test.py
```

The suite covers health, auth (login + register edge cases), produce CRUD, buyer requests, approve/reject, transporter accept → deliver → complete, ratings, and chat. Expected result:

```
RESULTS: 42 passed, 0 failed
```

> The test suite mutates the database (creates and consumes test requests/deliveries). Re-run `backend/schema.sql` to restore the clean demo state.

---

## Project structure

```
FarmConnect_Group13/
├── backend/
│   ├── app.py            # Flask API: auth, produce, requests, deliveries, ratings, chat, seed
│   ├── config.py         # Reads DB settings from .env
│   ├── seed.py           # Standalone demo-data seed script
│   ├── schema.sql        # Full schema + demo seed (drop-in reset)
│   ├── requirements.txt
│   └── .env.example      # Copy to .env and edit
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios clients per role
│   │   ├── components/   # Shared UI (cards, layout, grid location picker, ...)
│   │   ├── context/      # Auth + role context
│   │   ├── dashboards/   # Buyer / Farmer / Transporter dashboards
│   │   ├── hooks/        # useAuth, useFarmerData, WebSocket chat
│   │   ├── pages/        # Login, Register, DashboardRouter, NotFound
│   │   ├── routes/       # AppRoutes
│   │   └── styles/       # Tailwind + globals
│   └── package.json
├── docs/                 # Architecture, API working, setup, testing guides
└── README.md
```

## Documentation

Full documentation lives in [`docs/`](docs/README.md) — see also `docs/SETUP.md`, `docs/FRONTEND_SETUP.md`, `docs/ARCHITECTURE.md`, and `docs/TESTING_GUIDE.md`.
