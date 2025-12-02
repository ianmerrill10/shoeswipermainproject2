import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

// Pages
import FeedPage from './pages/FeedPage';
import SearchPage from './pages/SearchPage';
import CheckMyFit from './pages/CheckMyFit';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import NFTMarketplace from './components/nft/NFTMarketplace';

// Admin Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { ProductManager } from './pages/admin/ProductManager';
import { UserManager } from './pages/admin/UserManager';

// Components
import BottomNavigation from './components/BottomNavigation';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading ShoeSwiper...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/" />} />

        {/* Main App Routes */}
        <Route path="/" element={<FeedPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/check-fit" element={<CheckMyFit />} />
        <Route path="/profile" element={session ? <ProfilePage /> : <Navigate to="/auth" />} />
        <Route path="/nft" element={session ? <NFTMarketplace /> : <Navigate to="/auth" />} />

        {/* Admin Routes - Protected by AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AnalyticsDashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="users" element={<UserManager />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Bottom Navigation - shown on main pages */}
      {!['/auth', '/admin'].some(path => window.location.pathname.startsWith(path)) && (
        <BottomNavigation />
      )}
    </div>
  );
}

export default App;
