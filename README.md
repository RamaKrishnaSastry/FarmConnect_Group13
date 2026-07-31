# FarmConnect

Web app connecting farmers, buyers, and transporters for produce sales and delivery.

```
backend/    Flask API (port 5000) + MySQL schema
frontend/   React + Vite app (port 5173)
docs/       All documentation (setup, architecture, testing, ...)
```

## Quick start

```bash
# 1. Paste backend/schema.sql into MySQL Workbench and run it
# 2. Backend (port 5000)
cd backend
pip install -r requirements.txt
python app.py

# 3. Frontend (port 5173) — separate terminal
cd ../frontend
npm install
npm run dev
```

Open http://localhost:5173 and log in with `farmer@farmconnect.com` / `password`
(also `buyer@...` and `transporter@...`, all password `password`).

Full documentation lives in [`docs/`](docs/README.md).
