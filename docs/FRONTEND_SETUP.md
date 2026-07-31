# FarmConnect Frontend Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 3. Build for Production
```bash
npm build
```

---

## 🏗️ Project Structure

```
frontend/
├── src/                    # Frontend source
│   ├── api/                # axios API layer (real backend calls)
│   ├── components/
│   │   ├── layout/         # Sidebar, Topbar, DashboardLayout
│   │   ├── common/         # Reusable UI components (Card, Table, Loader, Badge)
│   │   └── charts/         # Data visualization components
│   ├── dashboards/
│   │   ├── FarmerDashboard/       # Farmer dashboard (fully implemented)
│   │   ├── BuyerDashboard/        # Buyer dashboard (fully implemented)
│   │   └── TransporterDashboard/  # Transporter dashboard (fully implemented)
│   ├── context/            # React Context (Auth, Role)
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components (Login, Dashboard, 404)
│   ├── routes/             # React Router setup
│   ├── styles/             # Global CSS + Tailwind
│   ├── utils/              # Helpers (formatters, constants)
│   ├── App.jsx             # Main app wrapper
│   └── main.jsx            # Vite entry point
├── index.html              # Vite HTML entry
├── package.json
├── vite.config.js          # Dev proxy /api → http://localhost:5000
├── tailwind.config.js
└── postcss.config.js
```

---

## 🔐 Authentication

### Demo Login
- **Email**: `farmer@farmconnect.com`
- **Password**: `password`

Auth is handled against the Flask backend via `src/context/AuthContext.jsx`.
The Vite dev server proxies `/api` to the backend on `localhost:5000`. To point
at a different backend, set `VITE_API_URL` in `frontend/.env.local`.

## 📊 Dashboards

✅ **All three dashboards are implemented:**
- **Farmer**: profile card, produce listings (add/edit/delete + photos), buyer
  requests (approve/reject), delivery tracking, ratings, chat, stats.
- **Buyer**: browse available produce, request purchases, track request status,
  rate product/delivery, message farmers.
- **Transporter**: available deliveries, accept/complete tasks, delivery history.

---

## 🎨 Styling

- **Framework**: Tailwind CSS (configured in `tailwind.config.js`)
- **Colors**:
  - Primary: `#10b981` (Green)
  - Secondary: `#059669` (Dark Green)
  - Accent: `#f59e0b` (Amber)

To customize colors, edit `tailwind.config.js`

---

## 🔌 API Integration

### Real Backend
All API calls go to the Flask backend through `src/api/axiosClient.js`
(base URL `VITE_API_URL` or `http://localhost:5000/api`). In dev, Vite proxies
`/api` → `http://localhost:5000`, so no CORS issues.

---

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)

---

## 🚧 Next Steps

1. ✅ All dashboards implemented (Farmer / Buyer / Transporter)
2. ✅ Connected to real backend API
3. ⏳ WebSocket for real-time chat (currently polling via REST)
4. ⏳ Deploy to production

---

## 📦 Dependencies

- **React** 18.2.0
- **React Router** 6.16.0
- **Axios** 1.5.0
- **Tailwind CSS** 3.3.5
- **Chart.js** + **react-chartjs-2** (for charts)
- **Heroicons** (for icons)

---

## 🐛 Troubleshooting

### Port already in use
```bash
npm run dev -- --port 3000
```

### Clear cache
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Tailwind not loading
```bash
npm install -D tailwindcss postcss autoprefixer
```

---

## 📄 Environment Variables

Create `frontend/.env.local`:
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🎯 Key Files to Edit

- **Add features**: `src/dashboards/FarmerDashboard/`
- **Styling**: `src/styles/globals.css`, `tailwind.config.js`
- **API endpoints**: `src/api/*.js`
- **Routing**: `src/routes/AppRoutes.jsx`

---

Happy Coding! 🌾
