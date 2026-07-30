import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import BuyerDashboard from './pages/BuyerDashboard';
import TransporterDashboard from './pages/TransporterDashboard';
import './App.css';

function App() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard/buyer" element={user.role === 'BUYER' ? <BuyerDashboard /> : <Navigate to="/" replace />} />
        <Route path="/dashboard/farmer" element={<Navigate to="/" replace />} />
        <Route path="/dashboard/transporter" element={user.role === 'TRANSPORTER' ? <TransporterDashboard /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
