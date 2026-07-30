import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const FARMER_CREDENTIALS = {
  email: 'farmer@farmconnect.com',
  password: 'password',
};

const LOGIN_USER = {
  id: 1, full_name: 'John Farmer', email: 'farmer@farmconnect.com',
  role: 'FARMER', phone: '555-1234', address: '123 Farm Lane',
  city: 'Springfield', state: 'IL', latitude: 39.7817, longitude: -89.6501,
};

export const LoginPage = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (
      email === FARMER_CREDENTIALS.email &&
      password === FARMER_CREDENTIALS.password
    ) {
      setUser(LOGIN_USER);
      navigate('/dashboard', { replace: true });
    } else {
      setError('Invalid email or password. Try farmer@farmconnect.com / password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-2">FarmConnect</h1>
        <p className="text-center text-gray-500 mb-6">Farmer Login</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="farmer@farmconnect.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition font-medium"
          >
            Login
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Demo: farmer@farmconnect.com / password
        </p>
      </div>
    </div>
  );
};
