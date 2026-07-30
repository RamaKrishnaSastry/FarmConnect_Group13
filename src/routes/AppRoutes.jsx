import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardRouter } from '../pages/DashboardRouter';
import { LoginPage } from '../pages/LoginPage';
import { NotFound } from '../pages/NotFound';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
