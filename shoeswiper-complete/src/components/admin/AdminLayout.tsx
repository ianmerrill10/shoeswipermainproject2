import React, { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import { FaBox, FaUsers, FaChartLine, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';

export const AdminLayout: React.FC = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAdmin === false) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  if (isAdmin === null) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Verifying Access...</div>;

  const navItems = [
    { path: '/admin', label: 'Overview', icon: FaChartLine },
    { path: '/admin/products', label: 'Products', icon: FaBox },
    { path: '/admin/users', label: 'Users', icon: FaUsers },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FaShieldAlt className="text-orange-500" /> Admin
          </h1>
          <p className="text-xs text-zinc-500 mt-1">dadsellsgadgets@gmail.com</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-orange-500/10 text-orange-500 font-bold' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <item.icon />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white transition-colors">
            <FaSignOutAlt /> Exit Admin
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
