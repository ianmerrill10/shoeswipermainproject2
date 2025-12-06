import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MusicPanel from '../MusicPanel';
import { Shoe } from '../../lib/types';

// Mock useAnalytics hook
const mockTrackMusicClick = vi.fn();
vi.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackMusicClick: mockTrackMusicClick,
  }),
}));

// Mock useFocusTrap hook
const mockFocusTrapRef = { current: null };
vi.mock('../../hooks/useFocusTrap', () => ({
  useFocusTrap: () => mockFocusTrapRef,
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

// Sample shoe data with music
const createMockShoe = (overrides = {}): Shoe => ({
  id: 'shoe-123',
  name: 'Air Jordan 1 Retro High OG',
  brand: 'Nike',
  price: 170,
  image_url: 'https://example.com/shoe.jpg',
  amazon_url: 'https://amazon.com/shoe',
  category: 'Basketball',
  style: 'high-top',
  colorway: 'Black/Red',
  release_date: '2023-01-01',
  music: {
    song: 'SICKO MODE',
    artist: 'Travis Scott',
    spotifyUrl: 'https://open.spotify.com/track/abc123',
    appleMusicUrl: 'https://music.apple.com/track/abc123',
    amazonMusicUrl: 'https://music.amazon.com/track/abc123',
  },
  ...overrides,
});

const createMockShoeWithoutMusic = (): Shoe => ({
  id: 'shoe-456',
  name: 'Nike Dunk Low',
  brand: 'Nike',
  price: 110,
  image_url: 'https://example.com/dunk.jpg',
  amazon_url: 'https://amazon.com/dunk',
  category: 'Lifestyle',
  style: 'low-top',
  colorway: 'White/Black',
  release_date: '2023-06-01',
  music: undefined,
});

describe('MusicPanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render nothing when shoe has no music', () => {
      const shoeWithoutMusic = createMockShoeWithoutMusic();
      const { container } = render(
        <MusicPanel shoe={shoeWithoutMusic} isOpen={true} onClose={mockOnClose} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render the panel when shoe has music and isOpen is true', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Now Playing')).toBeInTheDocument();
    });

    it('should render song and artist information', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('SICKO MODE')).toBeInTheDocument();
      expect(screen.getByText('Travis Scott')).toBeInTheDocument();
    });

    it('should render paired shoe information', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Paired with')).toBeInTheDocument();
      expect(screen.getByText('Nike')).toBeInTheDocument();
      expect(screen.getByText('Air Jordan 1 Retro High OG')).toBeInTheDocument();
      expect(screen.getByAltText('Air Jordan 1 Retro High OG')).toBeInTheDocument();
    });

    it('should render Spotify button when spotifyUrl is present', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Play on Spotify')).toBeInTheDocument();
    });

    it('should render Apple Music button when appleMusicUrl is present', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Play on Apple Music')).toBeInTheDocument();
    });

    it('should render Amazon Music button when amazonMusicUrl is present', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Play on Amazon Music')).toBeInTheDocument();
    });

    it('should not render Spotify button when spotifyUrl is missing', () => {
      const shoe = createMockShoe({
        music: {
          song: 'Test Song',
          artist: 'Test Artist',
          appleMusicUrl: 'https://music.apple.com/track/abc123',
          amazonMusicUrl: 'https://music.amazon.com/track/abc123',
        },
      });
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.queryByText('Play on Spotify')).not.toBeInTheDocument();
    });

    it('should not render Apple Music button when appleMusicUrl is missing', () => {
      const shoe = createMockShoe({
        music: {
          song: 'Test Song',
          artist: 'Test Artist',
          spotifyUrl: 'https://open.spotify.com/track/abc123',
          amazonMusicUrl: 'https://music.amazon.com/track/abc123',
        },
      });
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.queryByText('Play on Apple Music')).not.toBeInTheDocument();
    });

    it('should not render Amazon Music button when amazonMusicUrl is missing', () => {
      const shoe = createMockShoe({
        music: {
          song: 'Test Song',
          artist: 'Test Artist',
          spotifyUrl: 'https://open.spotify.com/track/abc123',
          appleMusicUrl: 'https://music.apple.com/track/abc123',
        },
      });
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.queryByText('Play on Amazon Music')).not.toBeInTheDocument();
    });
  });

  describe('Panel State', () => {
    it('should apply translate-x-0 class when isOpen is true', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const panel = screen.getByRole('dialog');
      expect(panel.className).toContain('translate-x-0');
    });

    it('should apply translate-x-full class when isOpen is false', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={false} onClose={mockOnClose} />);

      const panel = screen.getByRole('dialog');
      expect(panel.className).toContain('translate-x-full');
    });

    it('should show backdrop with opacity-100 when isOpen is true', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop?.className).toContain('opacity-100');
    });

    it('should hide backdrop with opacity-0 and pointer-events-none when isOpen is false', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={false} onClose={mockOnClose} />);

      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop?.className).toContain('opacity-0');
      expect(backdrop?.className).toContain('pointer-events-none');
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close music panel');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const backdrop = document.querySelector('[aria-hidden="true"]');
      fireEvent.click(backdrop!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Music Platform Clicks', () => {
    it('should track analytics and open Spotify URL when Spotify button is clicked', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const spotifyButton = screen.getByLabelText('Play SICKO MODE by Travis Scott on Spotify');
      fireEvent.click(spotifyButton);

      expect(mockTrackMusicClick).toHaveBeenCalledWith(
        'spotify',
        'shoe-123',
        'SICKO MODE',
        'Travis Scott'
      );
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://open.spotify.com/track/abc123',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should track analytics and open Apple Music URL when Apple Music button is clicked', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const appleMusicButton = screen.getByLabelText('Play SICKO MODE by Travis Scott on Apple Music');
      fireEvent.click(appleMusicButton);

      expect(mockTrackMusicClick).toHaveBeenCalledWith(
        'apple_music',
        'shoe-123',
        'SICKO MODE',
        'Travis Scott'
      );
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://music.apple.com/track/abc123',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should track analytics and open Amazon Music URL when Amazon Music button is clicked', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const amazonMusicButton = screen.getByLabelText('Play SICKO MODE by Travis Scott on Amazon Music');
      fireEvent.click(amazonMusicButton);

      expect(mockTrackMusicClick).toHaveBeenCalledWith(
        'amazon_music',
        'shoe-123',
        'SICKO MODE',
        'Travis Scott'
      );
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://music.amazon.com/track/abc123',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('URL Validation Security', () => {
    it('should NOT open window for non-https URLs', () => {
      const shoe = createMockShoe({
        music: {
          song: 'Test Song',
          artist: 'Test Artist',
          spotifyUrl: 'http://malicious-site.com/track', // http instead of https
          appleMusicUrl: 'https://music.apple.com/track/abc123',
          amazonMusicUrl: 'https://music.amazon.com/track/abc123',
        },
      });
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const spotifyButton = screen.getByText('Play on Spotify').closest('button')!;
      fireEvent.click(spotifyButton);

      // Analytics should still be tracked
      expect(mockTrackMusicClick).toHaveBeenCalled();
      // But window.open should NOT be called for non-https URL
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('should NOT open window for javascript: URLs', () => {
      const shoe = createMockShoe({
        music: {
          song: 'Test Song',
          artist: 'Test Artist',
          spotifyUrl: 'javascript:alert("xss")',
          appleMusicUrl: 'https://music.apple.com/track/abc123',
          amazonMusicUrl: 'https://music.amazon.com/track/abc123',
        },
      });
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const spotifyButton = screen.getByText('Play on Spotify').closest('button')!;
      fireEvent.click(spotifyButton);

      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('should open window for valid https URLs', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const spotifyButton = screen.getByText('Play on Spotify').closest('button')!;
      fireEvent.click(spotifyButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://open.spotify.com/track/abc123',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have role="dialog" on the panel', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal="true" on the panel', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const panel = screen.getByRole('dialog');
      expect(panel).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to the title', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const panel = screen.getByRole('dialog');
      expect(panel).toHaveAttribute('aria-labelledby', 'music-panel-title');
      expect(screen.getByText('Now Playing')).toHaveAttribute('id', 'music-panel-title');
    });

    it('should have aria-hidden="true" on the backdrop', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
    });

    it('should have aria-label on close button', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText('Close music panel')).toBeInTheDocument();
    });

    it('should have descriptive aria-labels on music platform buttons', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText('Play SICKO MODE by Travis Scott on Spotify')).toBeInTheDocument();
      expect(screen.getByLabelText('Play SICKO MODE by Travis Scott on Apple Music')).toBeInTheDocument();
      expect(screen.getByLabelText('Play SICKO MODE by Travis Scott on Amazon Music')).toBeInTheDocument();
    });

    it('should have aria-hidden on decorative icons', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      // Icons should have aria-hidden="true"
      const closeButton = screen.getByLabelText('Close music panel');
      const icon = closeButton.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Album Art Colors', () => {
    const artistColorTests = [
      { artist: 'Travis Scott', expectedClass: 'from-amber-900' },
      { artist: 'Drake', expectedClass: 'from-zinc-800' },
      { artist: 'Kendrick Lamar', expectedClass: 'from-red-900' },
      { artist: 'Kanye West', expectedClass: 'from-purple-900' },
      { artist: 'Daft Punk', expectedClass: 'from-cyan-900' },
      { artist: 'The Weeknd', expectedClass: 'from-red-800' },
      { artist: 'Dua Lipa', expectedClass: 'from-pink-800' },
      { artist: 'Unknown Artist', expectedClass: 'from-orange-900' }, // default
    ];

    artistColorTests.forEach(({ artist, expectedClass }) => {
      it(`should use ${expectedClass} gradient for ${artist}`, () => {
        const shoe = createMockShoe({
          music: {
            song: 'Test Song',
            artist,
            spotifyUrl: 'https://open.spotify.com/track/abc123',
          },
        });
        render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

        // Find the album art container
        const albumArtContainer = document.querySelector('.aspect-square');
        expect(albumArtContainer?.className).toContain(expectedClass);
      });
    });
  });

  describe('Visual Elements', () => {
    it('should render the spinning vinyl effect', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const vinylDisc = document.querySelector('.animate-spin-slow');
      expect(vinylDisc).toBeInTheDocument();
    });

    it('should render sound wave animation bars', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const soundWaveBars = document.querySelectorAll('.animate-pulse');
      expect(soundWaveBars.length).toBe(5);
    });

    it('should render affiliate badges on Apple Music and Amazon Music buttons', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      const affiliateBadges = screen.getAllByText('Affiliate');
      expect(affiliateBadges).toHaveLength(2); // Apple Music and Amazon Music
    });

    it('should render Free badge on Spotify button', () => {
      const shoe = createMockShoe();
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Free')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle shoe with only one music platform', () => {
      const shoe = createMockShoe({
        music: {
          song: 'Solo Platform Song',
          artist: 'Solo Artist',
          spotifyUrl: 'https://open.spotify.com/track/solo123',
        },
      });
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Play on Spotify')).toBeInTheDocument();
      expect(screen.queryByText('Play on Apple Music')).not.toBeInTheDocument();
      expect(screen.queryByText('Play on Amazon Music')).not.toBeInTheDocument();
    });

    it('should handle long song titles', () => {
      const longTitle = 'This Is A Very Long Song Title That Might Cause Layout Issues';
      const shoe = createMockShoe({
        music: {
          song: longTitle,
          artist: 'Test Artist',
          spotifyUrl: 'https://open.spotify.com/track/abc123',
        },
      });
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle special characters in song and artist names', () => {
      const shoe = createMockShoe({
        music: {
          song: "Don't Stop Me Now (feat. Someone)",
          artist: 'Artist & Friends',
          spotifyUrl: 'https://open.spotify.com/track/abc123',
        },
      });
      render(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Don't Stop Me Now (feat. Someone)")).toBeInTheDocument();
      expect(screen.getByText('Artist & Friends')).toBeInTheDocument();
    });
  });
});

describe('MusicPanel Integration', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should work correctly through a full user interaction flow', () => {
    const shoe = createMockShoe();
    const { rerender } = render(
      <MusicPanel shoe={shoe} isOpen={false} onClose={mockOnClose} />
    );

    // Panel starts closed
    expect(screen.getByRole('dialog').className).toContain('translate-x-full');

    // Panel opens
    rerender(<MusicPanel shoe={shoe} isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole('dialog').className).toContain('translate-x-0');

    // User clicks Spotify
    const spotifyButton = screen.getByText('Play on Spotify').closest('button')!;
    fireEvent.click(spotifyButton);
    expect(mockTrackMusicClick).toHaveBeenCalledTimes(1);
    expect(mockWindowOpen).toHaveBeenCalledTimes(1);

    // User clicks close
    const closeButton = screen.getByLabelText('Close music panel');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
