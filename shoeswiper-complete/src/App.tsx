import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthGuard } from './hooks/useAuthGuard';

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
import OnboardingFlow from './components/OnboardingFlow';
import ErrorBoundary from './components/ErrorBoundary';
import { FullPageLoader } from './components/LoadingStates';

const ONBOARDING_KEY = 'shoeswiper_onboarding';

function App() {
  const { user, loading, isAllowed } = useAuthGuard();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Check if onboarding should be shown
  useEffect(() => {
    const checkOnboarding = () => {
      try {
        const stored = localStorage.getItem(ONBOARDING_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setShowOnboarding(!data.completed);
        } else {
          // First visit - show onboarding
          setShowOnboarding(true);
        }
      } catch {
        // On error, show onboarding
        setShowOnboarding(true);
      }
      setOnboardingChecked(true);
    };

    checkOnboarding();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading || !onboardingChecked) {
    return <FullPageLoader message="Loading ShoeSwiper..." />;
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
  // If onboarding is being shown, render it as a full overlay
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <ErrorBoundary showHomeButton>
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
      </div>
    </ErrorBoundary>
  );
}

export default App;
