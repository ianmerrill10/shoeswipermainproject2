import { supabase } from '../lib/supabaseClient';

const Unauthorized = () => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
      <div className="text-6xl mb-4">🔒</div>
      <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
      <p className="text-gray-400 mb-8 text-center">
        Sorry, your account is not authorized to access ShoeSwiper yet.
      </p>
      <button
        onClick={handleSignOut}
        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Unauthorized;
