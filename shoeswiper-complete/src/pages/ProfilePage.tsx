import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { FaCog, FaSignOutAlt, FaHeart, FaShoppingBag, FaShieldAlt, FaGem, FaBell, FaFileContract, FaUserShield } from 'react-icons/fa';
import { Profile, Shoe } from '../lib/types';
import { SneakerCard } from '../components/SneakerCard';
import ReferralCard from '../components/ReferralCard';
import NotificationSettings from '../components/NotificationSettings';
import { usePushNotifications } from '../hooks/usePushNotifications';

type Tab = 'favorites' | 'closet';

// Type for user_sneakers join result
interface UserSneakerWithShoe {
  shoe: Shoe;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled: pushEnabled } = usePushNotifications();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<Shoe[]>([]);
  const [closet, _setCloset] = useState<Shoe[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('favorites');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (!user) {
        navigate('/auth');
        return;
      }

      setLoading(true);
      setError(null);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: favoritesData, error: favError } = await supabase
        .from('user_sneakers')
        .select('*, shoe:shoes(*)')
        .eq('user_id', user.id);

      if (favError) throw favError;

      const shoes = (favoritesData as UserSneakerWithShoe[] | null)?.map(f => f.shoe) || [];
      setFavorites(shoes);
    } catch (err) {
      console.error('[ProfilePage] Error loading profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="text-red-400 text-center mb-4">
          <p className="text-lg font-medium">{error}</p>
        </div>
        <button
          onClick={loadProfile}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Admin status from profile table (secure - no email comparison in frontend)
  const isAdmin = profile?.is_admin === true;

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-orange-500/20 to-transparent p-6 pt-12">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-orange-500 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-orange-500">
                  {profile?.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{profile?.username || 'User'}</h1>
              <p className="text-zinc-400 text-sm">{profile?.email}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                  <FaShieldAlt /> Admin
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white" aria-label="Settings">
              <FaCog aria-hidden="true" />
            </button>
            <button onClick={handleSignOut} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-400" aria-label="Sign out">
              <FaSignOutAlt aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{favorites.length}</p>
            <p className="text-xs text-zinc-400">Favorites</p>
          </div>
          <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{closet.length}</p>
            <p className="text-xs text-zinc-400">Closet</p>
          </div>
          <button
            onClick={() => navigate('/nft')}
            className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-xl p-3 text-center hover:border-violet-400"
          >
            <p className="text-lg font-bold text-violet-300"><FaGem className="inline" /></p>
            <p className="text-xs text-violet-300">My NFTs</p>
          </button>
        </div>
      </div>

      {/* Admin Button */}
      {isAdmin && (
        <div className="px-6 mb-4">
          <button
            onClick={() => navigate('/admin')}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white font-bold flex items-center justify-center gap-2"
          >
            <FaShieldAlt /> Open Admin Dashboard
          </button>
        </div>
      )}

      {/* Referral Program */}
      <div className="px-6 mb-4">
        <ReferralCard />
      </div>

      {/* Notification Settings */}
      <div className="px-6 mb-4">
        <button
          onClick={() => setShowNotificationSettings(true)}
          className="w-full bg-zinc-900 rounded-xl p-4 flex items-center justify-between hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              pushEnabled ? 'bg-green-500/20' : 'bg-zinc-800'
            }`}>
              <FaBell className={pushEnabled ? 'text-green-500' : 'text-zinc-500'} />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Push Notifications</p>
              <p className="text-zinc-500 text-xs">
                {pushEnabled ? 'Enabled - Get price drop alerts' : 'Enable to get deal alerts'}
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-bold ${
            pushEnabled ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
          }`}>
            {pushEnabled ? 'ON' : 'OFF'}
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 z-10" role="tablist" aria-label="Profile sections">
        <div className="flex px-6">
          <button
            onClick={() => setActiveTab('favorites')}
            role="tab"
            aria-selected={activeTab === 'favorites'}
            aria-controls="favorites-panel"
            id="favorites-tab"
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'favorites'
                ? 'text-orange-500 border-orange-500'
                : 'text-zinc-400 border-transparent'
            }`}
          >
            <FaHeart aria-hidden="true" /> Favorites
          </button>
          <button
            onClick={() => setActiveTab('closet')}
            role="tab"
            aria-selected={activeTab === 'closet'}
            aria-controls="closet-panel"
            id="closet-tab"
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'closet'
                ? 'text-orange-500 border-orange-500'
                : 'text-zinc-400 border-transparent'
            }`}
          >
            <FaShoppingBag aria-hidden="true" /> My Closet
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'favorites' && (
          <div role="tabpanel" id="favorites-panel" aria-labelledby="favorites-tab">
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <FaHeart className="text-4xl text-zinc-700 mx-auto mb-4" aria-hidden="true" />
              <p className="text-zinc-400">No favorites yet</p>
              <p className="text-zinc-500 text-sm mt-1">Like sneakers to save them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3" role="list" aria-label="Favorite sneakers">
              {favorites.map(shoe => (
                <SneakerCard key={shoe.id} shoe={shoe} variant="grid" />
              ))}
            </div>
          )}
          </div>
        )}

        {activeTab === 'closet' && (
          <div role="tabpanel" id="closet-panel" aria-labelledby="closet-tab">
          {closet.length === 0 ? (
            <div className="text-center py-16">
              <FaShoppingBag className="text-4xl text-zinc-700 mx-auto mb-4" aria-hidden="true" />
              <p className="text-zinc-400">No sneakers in your closet</p>
              <p className="text-zinc-500 text-sm mt-1">Add sneakers you own to mint NFTs</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3" role="list" aria-label="Closet sneakers">
              {closet.map(shoe => (
                <SneakerCard key={shoe.id} shoe={shoe} variant="grid" />
              ))}
            </div>
          )}
          </div>
        )}
      </div>

      {/* Legal Links Footer */}
      <div className="px-6 py-8 border-t border-zinc-800 mt-8">
        <div className="flex justify-center gap-6 text-sm">
          <Link
            to="/privacy"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <FaUserShield className="text-xs" aria-hidden="true" />
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <FaFileContract className="text-xs" aria-hidden="true" />
            Terms of Service
          </Link>
        </div>
        <p className="text-center text-zinc-600 text-xs mt-4">
          ShoeSwiper &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* Notification Settings Panel */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
    </div>
  );
};

export default ProfilePage;
