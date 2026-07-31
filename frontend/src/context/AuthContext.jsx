import { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

const normalizeRole = (role) => role?.toUpperCase?.() || '';

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    if (typeof window === 'undefined') return null;

    try {
      const savedUser = localStorage.getItem('farmconnect_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const persistUser = useCallback((nextUser) => {
    const normalizedUser = nextUser
      ? { ...nextUser, role: normalizeRole(nextUser.role) }
      : null;

    setUserState(normalizedUser);

    if (typeof window !== 'undefined') {
      if (normalizedUser) {
        localStorage.setItem('farmconnect_user', JSON.stringify(normalizedUser));
      } else {
        localStorage.removeItem('farmconnect_user');
      }
    }

    return normalizedUser;
  }, []);

  const setUser = useCallback((nextUser) => persistUser(nextUser), [persistUser]);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const loggedUser = data.user || data;
      return persistUser(loggedUser);
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [persistUser]);

  const register = useCallback(async (payload) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const registeredUser = data.user || data;
      return persistUser(registeredUser);
    } catch (err) {
      const message = err.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [persistUser]);

  const logout = useCallback(() => {
    persistUser(null);
    setError(null);
  }, [persistUser]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const savedUser = localStorage.getItem('farmconnect_user');
    if (savedUser) {
      try {
        persistUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('farmconnect_user');
      }
    }

    setLoading(false);
  }, [persistUser]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
