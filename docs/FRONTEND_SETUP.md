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
src/
├── api/                    # API layer (mock + real endpoints)
├── components/
│   ├── layout/            # Sidebar, Topbar, DashboardLayout
│   ├── common/            # Reusable UI components (Card, Table, Loader, Badge)
│   └── charts/            # Data visualization components
├── dashboards/
│   ├── FarmerDashboard/   # Farmer dashboard (fully implemented)
│   ├── BuyerDashboard/    # Stub - ready for implementation
│   └── TransporterDashboard/ # Stub - ready for implementation
├── context/               # React Context (Auth, Role)
├── hooks/                 # Custom React hooks
├── pages/                 # Page components (Login, Dashboard, 404)
├── routes/                # React Router setup
├── styles/                # Global CSS + Tailwind
├── utils/                 # Helpers (formatters, constants)
├── App.jsx                # Main app wrapper
└── main.jsx              # Vite entry point
```

---

## 🔐 Authentication

### Demo Login
- **Email**: `farmer@farmconnect.com`
- **Password**: `password`

The app uses mock authentication. To connect to a real backend:
1. Update `VITE_API_URL` in `.env.local`
2. Replace mock data in `src/api/farmerApi.js` with real API calls

---

## 📊 Farmer Dashboard Features

✅ **Currently Implemented:**
- Profile Card (farmer info)
- Produce Listings (add, edit, delete with images)
- Buyer Requests (approve, reject with details)
- Delivery Tracking (real-time status)
- Ratings (star ratings with reviews)
- Chat Section (buyer communication)
- Stats Overview (key metrics)

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

### Mock Data
All API calls use mock data in `src/api/farmerApi.js`.

### Connecting to Real Backend
1. Install Axios (already included):
   ```bash
   npm install axios
   ```

2. Update `src/api/axiosClient.js`:
   ```javascript
   const API_BASE_URL = process.env.VITE_API_URL || 'https://your-backend.com/api';
   ```

3. Replace mock functions with real API calls:
   ```javascript
   export const getProduceListing = async (farmerId) => {
     const { data } = await axiosClient.get(`/produce/${farmerId}`);
     return data;
   };
   ```

---

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)

---

## 🚧 Next Steps

1. ✅ Scaffold complete
2. ⏳ Connect to backend API (replace mock data)
3. ⏳ Implement Buyer Dashboard
4. ⏳ Implement Transporter Dashboard
5. ⏳ Add WebSocket for real-time chat
6. ⏳ Deploy to production

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

Create `.env.local`:
```
VITE_API_URL=http://localhost:3000/api
```

---

## 🎯 Key Files to Edit

- **Add features**: `src/dashboards/FarmerDashboard/`
- **Styling**: `src/styles/globals.css`, `tailwind.config.js`
- **API endpoints**: `src/api/*.js`
- **Routing**: `src/routes/AppRoutes.jsx`

---

Happy Coding! 🌾
