# FarmConnect Setup Guide

## Project Structure (active stack)

```
FarmConnect_Group13/
├── backend/                 # Flask API (port 5000)
│   ├── app.py               # All API routes (auth, produce, requests, deliveries, ratings, chat)
│   ├── config.py            # Reads DB config from .env (python-dotenv)
│   ├── schema.sql           # FULL database schema + demo data — paste into MySQL Workbench
│   ├── seed.py              # Re-seed demo data (safe to re-run)
│   ├── requirements.txt     # Python dependencies
│   └── .env / .env.example  # DB credentials
│
├── frontend/                # React + Vite app (port 5173)
│   ├── src/                 # components / context / dashboards / hooks / pages / routes / api / utils
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js       # /api proxy → http://localhost:5000
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── .github/                 # Project board
├── .gitignore
└── *.md                     # Docs (README, QUICK_START, ARCHITECTURE, ...)
```

## Prerequisites

- Python 3.8+
- Node.js 16+ and npm
- MySQL 8.0+

## 1. Database

Open `backend/schema.sql` in MySQL Workbench and run the **entire file**.
It creates the `farmconnect` database, all tables, and demo data.
Alternatively, from the CLI:

```bash
mysql -u root -p < backend/schema.sql
```

## 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux
pip install -r requirements.txt
```

Create `backend/.env` from `.env.example` and adjust the DB credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=farmconnect
```

Start the server:

```bash
python app.py
```

Server runs at `http://localhost:5000` (the root `/` page lists every endpoint).

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. The Vite dev server proxies `/api`
requests to the Flask backend on port 5000, so no CORS issues in development.
`VITE_API_URL` can be set in `frontend/.env.local` if the backend is not on
`localhost:5000`.

## 4. Demo accounts

All passwords are `password`:

| Role        | Email                        |
|-------------|------------------------------|
| Farmer      | farmer@farmconnect.com       |
| Buyer       | buyer@farmconnect.com        |
| Transporter | transporter@farmconnect.com  |

`POST /api/auth/register` also supports creating new accounts:
`{"full_name": "...", "email": "...", "password": "...", "role": "FARMER"}`.

## 5. Re-seeding

```bash
cd backend
python seed.py
```
or `GET /api/seed` once the server is running.

## API Endpoints

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me?user_id=`
- Produce: `GET /api/produce/<farmer_id>`, `POST /api/produce`, `PUT/DELETE /api/produce/<id>`, `POST /api/produce/<id>/photos`
- Requests: `GET /api/requests/<farmer_id>`, `PUT /api/requests/<id>/approve|reject`,
  `POST /api/buyer/requests`, `GET /api/buyer/requests/<buyer_id>`, `PUT /api/buyer/requests/<id>`
- Buyer dashboard: `GET /api/buyer/dashboard/<buyer_id>`
- Deliveries: `GET /api/deliveries/<farmer_id>`,
  `GET /api/transporter/dashboard/<transporter_id>`,
  `PUT /api/transporter/deliveries/<id>/accept`,
  `PUT /api/transporter/deliveries/<id>/status`
- Ratings: `POST /api/ratings`, `GET /api/ratings/<farmer_id>`
- Chat: `GET /api/chat/<request_id>`, `POST /api/chat`

## Security notes

- Passwords are hashed with Werkzeug (`scrypt`) / bcrypt — never stored plaintext.
- All SQL uses parameterized queries (SQL-injection safe).
- `config.py` reads secrets from `backend/.env`, which is git-ignored.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| MySQL connection error | Start the MySQL service; check `backend/.env` |
| Tables missing | Re-run `backend/schema.sql` |
| Port 5000 in use | Change `FLASK_PORT` in `.env` + proxy target in `vite.config.js` |
| Port 5173 in use | `npm run dev -- --port 3000` |
| API calls failing | Confirm backend is up and `VITE_API_URL` is correct |
| ModuleNotFoundError | `pip install -r requirements.txt` in the venv |
