import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthGuard } from './hooks/useAuthGuard';
import { useExitIntent } from './hooks/useExitIntent';

// Pages
import FeedPage from './pages/FeedPage';
import SearchPage from './pages/SearchPage';
import ClosetPage from './pages/ClosetPage';
import CheckMyFit from './pages/CheckMyFit';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import ComingSoon from './pages/ComingSoon';
import Unauthorized from './pages/Unauthorized';
import NFTMarketplace from './components/nft/NFTMarketplace';

// Admin Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { ProductManager } from './pages/admin/ProductManager';
import { UserManager } from './pages/admin/UserManager';

// Components
import BottomNavigation from './components/BottomNavigation';
import ExitIntentPopup from './components/ExitIntentPopup';

function App() {
  const { user, loading, isAllowed } = useAuthGuard();
  const { isShowing, closePopup, dismissPermanently } = useExitIntent({
    delay: 5000,           // Wait 5 seconds before enabling
    minSessionTime: 15000, // User must be on site for at least 15 seconds
    cooldownHours: 24,     // Show only once per day
  });

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

  // If user is logged in but not in allowed list, show Unauthorized page
  if (user && !isAllowed) {
    return (
      <Routes>
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    );
  }

  // If not logged in or not allowed, show Coming Soon (except for /auth route)
  if (!isAllowed) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    );
  }

  // User is authenticated and allowed - show full app
  return (
    <div className="min-h-screen bg-zinc-950">
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth" element={<Navigate to="/" />} />

        {/* Main App Routes */}
        <Route path="/" element={<FeedPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/closet" element={<ClosetPage />} />
        <Route path="/check-fit" element={<CheckMyFit />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/nft" element={<NFTMarketplace />} />

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

      {/* Exit Intent Popup - for email capture when user tries to leave */}
      <ExitIntentPopup
        isOpen={isShowing}
        onClose={closePopup}
        onDismissPermanently={dismissPermanently}
      />
    </div>
  );
}

export default App;
