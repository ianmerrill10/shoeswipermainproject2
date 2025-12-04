const ComingSoon = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 flex flex-col items-center justify-center text-white p-4">
      {/* Logo */}
      <div className="text-6xl mb-4" aria-hidden="true">👟</div>
      
      {/* Title */}
      <h1 className="text-5xl md:text-7xl font-bold mb-4 text-center">
        ShoeSwiper
      </h1>
      
      {/* Tagline */}
      <p className="text-xl md:text-2xl text-purple-300 mb-8 text-center">
        Swipe. Match. Drip.
      </p>
      
      {/* Coming Soon Badge */}
      <div className="bg-purple-600 px-8 py-4 rounded-full mb-8" role="status">
        <span className="text-2xl font-bold">Coming Soon</span>
      </div>
      
      {/* Description */}
      <p className="text-lg text-gray-300 text-center max-w-md mb-8">
        The ultimate sneaker discovery app. Find your perfect kicks with AI-powered style matching.
      </p>
      
      {/* Social Links */}
      <nav className="flex gap-4 mb-8" aria-label="Social media links">
        <a 
          href="https://tiktok.com/@shoeswiper" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full transition"
        >
          Follow on TikTok
        </a>
      </nav>
      
      {/* Admin Login (subtle) */}
      <a 
        href="/auth" 
        className="text-sm text-gray-500 hover:text-gray-400 transition mt-8"
      >
        Admin Login
      </a>
    </main>
  );
};

export default ComingSoon;
