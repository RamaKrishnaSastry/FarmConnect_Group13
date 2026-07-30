import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardRouter } from '../pages/DashboardRouter';
import { LoginPage } from '../pages/LoginPage';
import { NotFound } from '../pages/NotFound';
import { useAuth } from '../hooks/useAuth';
import { getDashboardPath, normalizeRole, ROLES } from '../utils/constants';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && normalizeRole(user.role) !== normalizeRole(requiredRole)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }
  return children;
};

export const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      <Route path="/dashboard/farmer" element={<ProtectedRoute requiredRole={ROLES.FARMER}><DashboardRouter /></ProtectedRoute>} />
      <Route path="/dashboard/buyer" element={<ProtectedRoute requiredRole={ROLES.BUYER}><DashboardRouter /></ProtectedRoute>} />
      <Route path="/dashboard/transporter" element={<ProtectedRoute requiredRole={ROLES.TRANSPORTER}><DashboardRouter /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={user ? getDashboardPath(user.role) : '/login'} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
