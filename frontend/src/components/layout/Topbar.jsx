import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const Topbar = ({ onStartTour = () => {} }) => {
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
    <header className="border-b border-green-100 bg-white/90 px-6 py-4 shadow-sm backdrop-blur md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-green-800">🌾 FarmConnect</h1>
          <p className="text-sm text-gray-600">
            Welcome back, <span className="font-semibold text-gray-800">{user?.full_name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onStartTour}
            className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
          >
            🎬 Tour
          </button>

          <button className="relative rounded-full p-2 text-gray-600 transition hover:bg-green-50 hover:text-green-700">
            🔔
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-2 transition hover:bg-green-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 font-bold text-white">
                {user?.full_name?.charAt(0) || 'F'}
              </span>
              <span className="text-sm font-medium text-gray-700">▼</span>
            </button>

            {showMenu && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                <div className="border-b border-gray-200 px-4 py-2">
                  <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50">👤 My Profile</button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50">⚙️ Settings</button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onStartTour();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  ❓ Help (take a tour)
                </button>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
