# FarmConnect Quick Start

## Prerequisites

- Python 3.8+ (Flask backend)
- Node.js 16+ / npm (React frontend)
- MySQL 8.0+ (or the pre-installed MySQL80 service on Windows)

## Step 1 — Database (MySQL Workbench)

Open **backend/schema.sql** and paste the **whole file** into the MySQL Workbench
Query tab, then run it. This creates the `farmconnect` database, all 7 tables
(`users`, `produce_listings`, `produce_photos`, `purchase_requests`, `deliveries`,
`ratings`, `chat_messages`) and demo seed data.

## Step 2 — Backend

```bash
cd backend
pip install -r requirements.txt
# optionally copy .env.example to .env and edit DB credentials
python app.py
```

✅ Backend runs at `http://localhost:5000` (root `/` lists all API endpoints).

## Step 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend opens at `http://localhost:5173` (Vite proxies `/api` → :5000).

## Step 4 — Log in

Demo accounts (password for all: **`password`**):

| Role        | Email                        |
|-------------|------------------------------|
| Farmer      | farmer@farmconnect.com       |
| Buyer       | buyer@farmconnect.com        |
| Transporter | transporter@farmconnect.com  |

New users can also register via `POST /api/auth/register` (JSON body with
`full_name`, `email`, `password`, `role` in FARMER/BUYER/TRANSPORTER).

## Re-seeding demo data

```bash
cd backend
python seed.py
```

Or, after the server is running: `GET http://localhost:5000/api/seed`

## Troubleshooting

- **"MySQL connection error"** → make sure the MySQL service is running
  (`Start-Service MySQL80`) and `backend/.env` matches your credentials.
- **Port 5000 in use** → change `FLASK_PORT` in `backend/.env` and update
  `vite.config.js` proxy target.
- **Tables missing** → re-run `backend/schema.sql` in Workbench.
- **Blank page** → check the browser console (F12) and confirm the backend is up.
