import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const Topbar = () => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🌾 FarmConnect</h1>
        <p className="text-sm text-gray-500">Welcome back, <span className="font-semibold text-gray-700">{user?.full_name}</span></p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.full_name?.charAt(0) || 'F'}
            </span>
            <span className="text-sm font-medium text-gray-700">▼</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm transition">
                👤 My Profile
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm transition">
                ⚙️ Settings
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm transition">
                ❓ Help
              </button>
              <hr className="my-2" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-medium transition"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
