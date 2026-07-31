import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ProfileModal } from '../common/ProfileModal';
import { HelpModal } from '../common/HelpModal';
import { SettingsModal } from '../common/SettingsModal';

export const Topbar = ({ onStartTour = () => {} }) => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const closeMenu = () => setShowMenu(false);

  return (
    <>
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

            <div className="relative">
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-2 transition hover:bg-green-100"
              >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 font-bold text-white">
                {user?.full_name?.charAt(0) || 'F'}
              </span>
              <span className="text-sm font-medium text-gray-700">▼</span>
            </button>

            {showMenu && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                <div className="border-b border-gray-200 px-4 py-2">
                  <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                  <p className="text-xs capitalize text-gray-500">{user?.role?.toLowerCase?.()}</p>
                </div>
                <button
                  onClick={() => { setShowProfile(true); closeMenu(); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  👤 My Profile
                </button>
                <button
                  onClick={() => { setShowSettings(true); closeMenu(); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  ⚙️ Settings
                </button>
                <button
                  onClick={() => { setShowHelp(true); closeMenu(); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  ❓ Help
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

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
};
