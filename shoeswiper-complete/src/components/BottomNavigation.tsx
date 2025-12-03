import React, { memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaMagic, FaUser, FaHeart } from 'react-icons/fa';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  special?: boolean;
}

const navItems: NavItem[] = [
  { path: '/', icon: FaHome, label: 'Feed' },
  { path: '/search', icon: FaSearch, label: 'Search' },
  { path: '/check-fit', icon: FaMagic, label: 'Check Fit', special: true },
  { path: '/closet', icon: FaHeart, label: 'Closet' },
  { path: '/profile', icon: FaUser, label: 'Profile' },
];

const BottomNavigation: React.FC = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 safe-bottom z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.special) {
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`relative -mt-8 flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/30'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                <item.icon className={`text-xl ${isActive ? 'text-white' : 'text-zinc-400'}`} />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className="flex flex-col items-center justify-center py-2 px-4 min-w-[60px]"
            >
              <item.icon
                className={`text-xl mb-1 transition-colors ${
                  isActive ? 'text-orange-500' : 'text-zinc-500'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-orange-500' : 'text-zinc-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNavigation.displayName = 'BottomNavigation';

export default BottomNavigation;
