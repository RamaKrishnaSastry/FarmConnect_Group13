import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardPath } from '../utils/constants';

const DEMO_ACCOUNTS = [
  { role: 'Farmer', email: 'farmer@farmconnect.com', password: 'password' },
  { role: 'Buyer', email: 'buyer@farmconnect.com', password: 'password' },
  { role: 'Transporter', email: 'transporter@farmconnect.com', password: 'password' },
];

export const LoginPage = () => {
  const { login, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = await login(email, password);
      navigate(getDashboardPath(user?.role), { replace: true });
    } catch {
      // Error is already surfaced through the auth context
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f6fff7_0%,#eef8ee_100%)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-green-100 bg-white/95 p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-700 text-2xl text-white">🌾</div>
          <h1 className="text-3xl font-bold text-green-800">FarmConnect</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to your dashboard</p>
        </div>

        {authError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {authError}
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
              placeholder="you@example.com"
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
            disabled={loading}
            className="w-full rounded-lg bg-green-700 px-4 py-2 font-medium text-white transition hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-green-700 hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-6 rounded-xl border border-green-100 bg-green-50/60 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-800">Demo accounts</p>
          <ul className="space-y-1 text-xs text-gray-600">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.role}>
                <span className="font-medium text-gray-800">{account.role}</span>: {account.email} / {account.password}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
