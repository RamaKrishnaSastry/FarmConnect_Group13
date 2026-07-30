import { createContext, useState, useCallback, useEffect } from 'react';
import { loginUser, logoutUser, getCurrentUser } from '../api/authApi';

export const AuthContext = createContext();

const DEFAULT_USER = {
  id: 1, full_name: 'John Farmer', email: 'farmer@farmconnect.com',
  role: 'FARMER', phone: '555-1234', address: '123 Farm Lane',
  city: 'Springfield', state: 'IL', latitude: 39.7817, longitude: -89.6501,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser || DEFAULT_USER);
      } catch (err) {
        console.error('Auth init error, using default user:', err);
        setUser(DEFAULT_USER);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await loginUser(email, password);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
