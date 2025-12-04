import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ClosetPage from '../ClosetPage';

// Mock config module
vi.mock('../../lib/config', () => ({
  DEMO_MODE: true,
}));

// Mock shoes data
const mockShoes = [
  {
    id: 'shoe-1',
    name: 'Air Force 1',
    brand: 'Nike',
    image_url: 'https://example.com/af1.jpg',
    amazon_url: 'https://amazon.com/dp/B123',
    amazon_asin: 'B123',
    price: 110,
    style_tags: ['casual', 'classic'],
    color_tags: ['white'],
    favorite_count: 100,
    view_count: 1000,
    click_count: 50,
    is_active: true,
    is_featured: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'shoe-2',
    name: 'Dunk Low',
    brand: 'Nike',
    image_url: 'https://example.com/dunk.jpg',
    amazon_url: 'https://amazon.com/dp/B456',
    amazon_asin: 'B456',
    price: 100,
    style_tags: ['streetwear'],
    color_tags: ['black', 'white'],
    favorite_count: 80,
    view_count: 800,
    click_count: 40,
    is_active: true,
    is_featured: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Mock useFavorites hook
const mockGetFavoriteIds = vi.fn().mockReturnValue(['shoe-1', 'shoe-2']);
const mockRemoveFavorite = vi.fn().mockResolvedValue(true);

vi.mock('../../hooks/useFavorites', () => ({
  useFavorites: () => ({
    getFavoriteIds: mockGetFavoriteIds,
    removeFavorite: mockRemoveFavorite,
    loading: false,
  }),
}));

// Mock useSneakers hook
const mockGetSneakerById = vi.fn((id: string) => {
  const shoe = mockShoes.find((s) => s.id === id);
  return Promise.resolve(shoe || null);
});

vi.mock('../../hooks/useSneakers', () => ({
  useSneakers: () => ({
    getSneakerById: mockGetSneakerById,
    trackClick: vi.fn(),
  }),
}));

// Mock useAnalytics hook
vi.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackShoeClick: vi.fn(),
    trackShare: vi.fn(),
    trackFavorite: vi.fn(),
  }),
}));

// Mock supabaseClient
vi.mock('../../lib/supabaseClient', () => ({
  getAffiliateUrl: vi.fn((url: string) => `${url}?tag=shoeswiper-20`),
}));

// Mock deepLinks
vi.mock('../../lib/deepLinks', () => ({
  createAffiliateShareData: vi.fn((shoe) => ({
    title: shoe.name,
    text: `Check out ${shoe.name}!`,
    url: shoe.amazon_url,
  })),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
  writable: true,
  configurable: true,
});

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ClosetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFavoriteIds.mockReturnValue(['shoe-1', 'shoe-2']);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page title', async () => {
    renderWithRouter(<ClosetPage />);

    await waitFor(() => {
      expect(screen.getByText('My Closet')).toBeInTheDocument();
    });
  });

  it('should navigate back when back button clicked', async () => {
    renderWithRouter(<ClosetPage />);

    await waitFor(() => {
      expect(screen.getByText('My Closet')).toBeInTheDocument();
    });

    // Find the back button by looking for the first button in the header area
    const backButtons = screen.getAllByRole('button');
    // The back button is typically the first button before the title
    if (backButtons.length > 0) {
      fireEvent.click(backButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    }
  });

  it('should render favorited shoes in grid', async () => {
    renderWithRouter(<ClosetPage />);

    await waitFor(() => {
      expect(screen.getByText('Air Force 1')).toBeInTheDocument();
      expect(screen.getByText('Dunk Low')).toBeInTheDocument();
    });
  });

  it('should show saved count', async () => {
    renderWithRouter(<ClosetPage />);

    await waitFor(() => {
      expect(screen.getByText('2 saved sneakers')).toBeInTheDocument();
    });
  });

  it('should render buy buttons for each shoe', async () => {
    renderWithRouter(<ClosetPage />);

    await waitFor(() => {
      const buyButtons = screen.getAllByText('Buy');
      expect(buyButtons).toHaveLength(2);
    });
  });

  it('should handle buy button click', async () => {
    renderWithRouter(<ClosetPage />);

    await waitFor(() => {
      expect(screen.getByText('Air Force 1')).toBeInTheDocument();
    });

    const buyButtons = screen.getAllByText('Buy');
    fireEvent.click(buyButtons[0]);

    expect(mockWindowOpen).toHaveBeenCalled();
  });

  it('should render brand badges', async () => {
    renderWithRouter(<ClosetPage />);

    await waitFor(() => {
      const nikeBadges = screen.getAllByText('Nike');
      expect(nikeBadges.length).toBeGreaterThan(0);
    });
  });
});

describe('ClosetPage - Empty State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFavoriteIds.mockReturnValue([]);
  });

  it('should show empty state when no favorites', async () => {
    renderWithRouter(<ClosetPage />);

    await waitFor(() => {
      expect(screen.getByText('Your closet is empty')).toBeInTheDocument();
    });
  });

  it('should show browse sneakers button in empty state', async () => {
    renderWithRouter(<ClosetPage />);

    await waitFor(() => {
      expect(screen.getByText('Browse Sneakers')).toBeInTheDocument();
    });
  });

  it('should navigate to feed when browse button clicked', async () => {
    renderWithRouter(<ClosetPage />);

    await waitFor(() => {
      expect(screen.getByText('Browse Sneakers')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Browse Sneakers'));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
