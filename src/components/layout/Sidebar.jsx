import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const currentTab = location.state?.tab || 'overview';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', tab: 'overview', icon: '📊' },
    { name: 'My Produce', path: '/dashboard', tab: 'produce', icon: '🌾' },
    { name: 'Buyer Requests', path: '/dashboard', tab: 'requests', icon: '📋' },
    { name:'Deliveries', path: '/dashboard', tab: 'deliveries', icon: '🚚' },
    { name: 'Ratings', path: '/dashboard', tab: 'ratings', icon: '⭐' },
    { name: 'Chat', path: '/dashboard', tab: 'chat', icon: '💬' },
  ];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-24'} bg-gradient-to-b from-green-700 to-green-800 text-white transition-all duration-300 flex flex-col shadow-xl`}>
      {/* Logo */}
      <div className="p-6 border-b border-green-600 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-3xl">🌾</span>
          {isOpen && <span className="ml-3 font-bold text-xl">FarmConnect</span>}
        </div>
      </div>

      {/* User Info */}
      {isOpen && user && (
        <div className="px-4 py-4 border-b border-green-600 text-xs">
          <p className="text-green-100">Logged in as</p>
          <p className="font-semibold truncate">{user.full_name}</p>
          <p className="text-green-200 text-xs">{user.role}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.tab}
            to={item.path}
            state={{ tab: item.tab }}
            className={`flex items-center px-4 py-3 rounded-lg transition duration-200 hover:shadow-lg ${
              currentTab === item.tab
                ? 'bg-green-600 shadow-lg'
                : 'hover:bg-green-600'
            }`}
            title={item.name}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {isOpen && <span className="ml-3 font-medium">{item.name}</span>}
          </Link>
        ))}
      </nav>

      {/* Toggle & Footer */}
      <div className="p-4 border-t border-green-600 space-y-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-2 hover:bg-green-600 rounded-lg transition text-lg font-bold"
          title={isOpen ? 'Collapse' : 'Expand'}
        >
          {isOpen ? '◀' : '▶'}
        </button>
        {isOpen && (
          <button className="w-full text-left px-4 py-2 hover:bg-green-600 rounded-lg transition text-sm">
            ⚙️ Settings
          </button>
        )}
      </div>
    </aside>
  );
};
