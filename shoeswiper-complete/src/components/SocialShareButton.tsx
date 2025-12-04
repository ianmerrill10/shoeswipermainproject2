import React, { useState } from 'react';
import {
  FaTwitter,
  FaFacebook,
  FaPinterest,
  FaWhatsapp,
  FaTelegram,
  FaLinkedin,
  FaEnvelope,
  FaShare,
  FaCopy,
  FaCheck,
} from 'react-icons/fa';
import { useSocialSharing, ShareResult } from '../hooks/useSocialSharing';
import {
  SocialPlatform,
  ShareableContent,
  createSneakerShareContent,
  PLATFORM_CONFIG,
} from '../lib/socialSyndication';

/**
 * Props for SocialShareButton component
 */
interface SocialShareButtonProps {
  /** Content to share - either provide content or sneaker */
  content?: ShareableContent;
  /** Sneaker data to share (alternative to content) */
  sneaker?: {
    id: string;
    name: string;
    brand: string;
    image_url?: string;
    amazon_url?: string;
    style_tags?: string[];
  };
  /** Variant style */
  variant?: 'icon' | 'button' | 'dropdown';
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Show platform dropdown on hover/click */
  showPlatforms?: boolean;
  /** Callback when share completes */
  onShare?: (result: ShareResult) => void;
  /** Custom class name */
  className?: string;
  /** User's referral code for tracking */
  referralCode?: string;
}

/**
 * Platform icon mapping
 */
const platformIcons: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  twitter: FaTwitter,
  facebook: FaFacebook,
  pinterest: FaPinterest,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  linkedin: FaLinkedin,
  email: FaEnvelope,
  instagram: FaShare, // Fallback since Instagram has no web share
  tiktok: FaShare, // Fallback since TikTok has no web share
};

/**
 * Platform colors for styling
 */
const platformColors: Record<SocialPlatform, string> = {
  twitter: 'hover:bg-sky-500 hover:text-white',
  facebook: 'hover:bg-blue-600 hover:text-white',
  pinterest: 'hover:bg-red-600 hover:text-white',
  whatsapp: 'hover:bg-green-500 hover:text-white',
  telegram: 'hover:bg-sky-400 hover:text-white',
  linkedin: 'hover:bg-blue-700 hover:text-white',
  email: 'hover:bg-zinc-600 hover:text-white',
  instagram: 'hover:bg-gradient-to-tr from-purple-500 to-pink-500 hover:text-white',
  tiktok: 'hover:bg-black hover:text-white',
};

/**
 * Social share button component for sharing sneakers and content
 * to various social media platforms.
 */
const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  content: providedContent,
  sneaker,
  variant = 'button',
  size = 'md',
  showPlatforms = true,
  onShare,
  className = '',
  referralCode,
}) => {
  const {
    shareToPlatform,
    copyShareLink,
    nativeShareAvailable,
    shareNative,
    availablePlatforms,
  } = useSocialSharing(referralCode);

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Get content from props or create from sneaker
  const content: ShareableContent | null = providedContent || 
    (sneaker ? createSneakerShareContent({
      id: sneaker.id,
      name: sneaker.name,
      brand: sneaker.brand,
      imageUrl: sneaker.image_url,
      amazonUrl: sneaker.amazon_url,
      styleTags: sneaker.style_tags,
    }) : null);

  if (!content) {
    return null;
  }

  // Size classes
  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2.5 text-base',
    lg: 'p-3 text-lg',
  };

  const iconSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };

  // Handle native share (mobile)
  const handleNativeShare = async () => {
    if (!nativeShareAvailable) return;
    
    setIsSharing(true);
    const result = await shareNative(content);
    setIsSharing(false);
    
    onShare?.(result);
  };

  // Handle platform share
  const handlePlatformShare = async (platform: SocialPlatform) => {
    setIsSharing(true);
    const result = await shareToPlatform(platform, content);
    setIsSharing(false);
    setIsOpen(false);
    
    onShare?.(result);
  };

  // Handle copy link
  const handleCopyLink = async () => {
    const result = await copyShareLink(content);
    
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    
    setIsOpen(false);
    onShare?.(result);
  };

  // Render icon-only variant
  if (variant === 'icon') {
    return (
      <button
        onClick={nativeShareAvailable ? handleNativeShare : () => setIsOpen(!isOpen)}
        disabled={isSharing}
        className={`${sizeClasses[size]} rounded-full bg-zinc-800/60 backdrop-blur-md text-white hover:bg-zinc-700 transition-colors ${className}`}
        aria-label="Share"
      >
        <FaShare className={iconSizeClasses[size]} />
      </button>
    );
  }

  // Render button variant with dropdown
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main share button */}
      <button
        onClick={nativeShareAvailable ? handleNativeShare : () => setIsOpen(!isOpen)}
        disabled={isSharing}
        className={`
          flex items-center gap-2 
          ${sizeClasses[size]} 
          px-4 
          bg-gradient-to-r from-orange-500 to-red-500 
          text-white font-bold 
          rounded-xl 
          hover:from-orange-400 hover:to-red-400 
          active:scale-95 
          transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        aria-label="Share"
        aria-expanded={isOpen}
      >
        <FaShare className={iconSizeClasses[size]} />
        <span>Share</span>
      </button>

      {/* Platform dropdown */}
      {showPlatforms && isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown menu */}
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden min-w-[200px]">
            <div className="p-2">
              <p className="text-xs text-zinc-400 uppercase font-bold px-2 py-1 mb-1">
                Share to
              </p>
              
              {availablePlatforms.map((platform) => {
                const Icon = platformIcons[platform];
                const config = PLATFORM_CONFIG[platform];
                
                return (
                  <button
                    key={platform}
                    onClick={() => handlePlatformShare(platform)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      text-zinc-300 text-sm
                      transition-colors
                      ${platformColors[platform]}
                    `}
                  >
                    <Icon className="text-lg" />
                    <span>{config.name}</span>
                  </button>
                );
              })}
              
              {/* Divider */}
              <div className="border-t border-zinc-700 my-2" />
              
              {/* Copy link button */}
              <button
                onClick={handleCopyLink}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm transition-colors
                  ${copied 
                    ? 'bg-green-500 text-white' 
                    : 'text-zinc-300 hover:bg-zinc-800'
                  }
                `}
              >
                {copied ? (
                  <>
                    <FaCheck className="text-lg" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="text-lg" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Compact social share buttons for inline display
 */
export const SocialShareIcons: React.FC<{
  content: ShareableContent;
  platforms?: SocialPlatform[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  referralCode?: string;
}> = ({
  content,
  platforms = ['twitter', 'facebook', 'whatsapp', 'email'],
  size = 'md',
  className = '',
  referralCode,
}) => {
  const { shareToPlatform } = useSocialSharing(referralCode);

  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {platforms.map((platform) => {
        const Icon = platformIcons[platform];
        
        return (
          <button
            key={platform}
            onClick={() => shareToPlatform(platform, content)}
            className={`
              ${sizeClasses[size]}
              rounded-full bg-zinc-800 text-zinc-400
              transition-colors
              ${platformColors[platform]}
            `}
            aria-label={`Share to ${PLATFORM_CONFIG[platform].name}`}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
};

export default SocialShareButton;
