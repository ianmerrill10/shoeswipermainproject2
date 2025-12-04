import React from 'react';
import { FaTimes, FaSpotify, FaApple, FaAmazon } from 'react-icons/fa';
import { Shoe } from '../lib/types';
import { useAnalytics, MusicPlatform } from '../hooks/useAnalytics';

interface MusicPanelProps {
  shoe: Shoe;
  isOpen: boolean;
  onClose: () => void;
}

const MusicPanel: React.FC<MusicPanelProps> = ({ shoe, isOpen, onClose }) => {
  const music = shoe.music;
  const { trackMusicClick } = useAnalytics();

  const handleMusicClick = (platform: MusicPlatform, url: string) => {
    if (music) {
      trackMusicClick(platform, shoe.id, music.song, music.artist);
    }
    window.open(url, '_blank');
  };

  // Generate a placeholder album art based on artist name
  const getAlbumArt = (artist: string) => {
    const colors: Record<string, string> = {
      'Travis Scott': 'from-amber-900 to-black',
      'Drake': 'from-zinc-800 to-black',
      'Kendrick Lamar': 'from-red-900 to-black',
      'Kanye West': 'from-purple-900 to-black',
      'Daft Punk': 'from-cyan-900 to-black',
      'The Weeknd': 'from-red-800 to-black',
      'Dua Lipa': 'from-pink-800 to-black',
    };
    return colors[artist] || 'from-orange-900 to-black';
  };

  if (!music) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="music-panel-title"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 p-4 flex items-center justify-between z-10">
          <h2 id="music-panel-title" className="text-lg font-bold text-white">Now Playing</h2>
          <button
            onClick={onClose}
            aria-label="Close music panel"
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        {/* Album Art */}
        <div className={`aspect-square bg-gradient-to-br ${getAlbumArt(music.artist)} flex items-center justify-center relative`}>
          {/* Spinning vinyl effect */}
          <div className="w-64 h-64 rounded-full bg-black/50 flex items-center justify-center animate-spin-slow">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border-4 border-zinc-700">
              <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-black" />
              </div>
            </div>
          </div>

          {/* Sound wave animation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-orange-500 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Song Info */}
        <div className="p-6 text-center border-b border-zinc-800">
          <h3 className="text-2xl font-black text-white mb-2">{music.song}</h3>
          <p className="text-lg text-zinc-400">{music.artist}</p>
        </div>

        {/* Streaming Links */}
        <div className="p-6 space-y-4">
          <p className="text-zinc-500 text-sm text-center mb-4">Listen on your favorite platform</p>

          {/* Spotify */}
          {music.spotifyUrl && (
            <button
              onClick={() => handleMusicClick('spotify', music.spotifyUrl!)}
              aria-label={`Play ${music.song} by ${music.artist} on Spotify`}
              className="w-full flex items-center gap-4 bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              <FaSpotify className="text-2xl" aria-hidden="true" />
              <span className="flex-1 text-left">Play on Spotify</span>
              <span className="text-sm opacity-75">Free</span>
            </button>
          )}

          {/* Apple Music */}
          {music.appleMusicUrl && (
            <button
              onClick={() => handleMusicClick('apple_music', music.appleMusicUrl!)}
              aria-label={`Play ${music.song} by ${music.artist} on Apple Music`}
              className="w-full flex items-center gap-4 bg-gradient-to-r from-[#FA57C1] to-[#FC5C7D] hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl transition-opacity"
            >
              <FaApple className="text-2xl" aria-hidden="true" />
              <span className="flex-1 text-left">Play on Apple Music</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Affiliate</span>
            </button>
          )}

          {/* Amazon Music */}
          {music.amazonMusicUrl && (
            <button
              onClick={() => handleMusicClick('amazon_music', music.amazonMusicUrl!)}
              aria-label={`Play ${music.song} by ${music.artist} on Amazon Music`}
              className="w-full flex items-center gap-4 bg-[#00A8E1] hover:bg-[#00bfff] text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              <FaAmazon className="text-2xl" aria-hidden="true" />
              <span className="flex-1 text-left">Play on Amazon Music</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Affiliate</span>
            </button>
          )}
        </div>

        {/* Paired With */}
        <div className="p-6 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm mb-3">Paired with</p>
          <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl">
            <img
              src={shoe.image_url}
              alt={shoe.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="text-xs text-orange-500 font-bold uppercase">{shoe.brand}</p>
              <p className="text-white font-bold">{shoe.name}</p>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="p-6 pb-8">
          <p className="text-zinc-600 text-xs text-center">
            Swipe through the feed to discover more music paired with sneakers
          </p>
        </div>
      </div>
    </>
  );
};

export default MusicPanel;
