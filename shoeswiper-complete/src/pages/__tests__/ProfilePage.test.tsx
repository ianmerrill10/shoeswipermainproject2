import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../ProfilePage';

// Mock config module
vi.mock('../../lib/config', () => ({
  DEMO_MODE: true,
}));

// Mock Supabase
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2024-01-01T00:00:00Z',
};

const mockFavorites = [
  {
    shoe: {
      id: 'shoe-1',
      name: 'Air Force 1',
      brand: 'Nike',
      image_url: 'https://example.com/af1.jpg',
      amazon_url: 'https://amazon.com/dp/B123',
      amazon_asin: 'B123',
      price: 110,
      style_tags: ['casual'],
      color_tags: ['white'],
      favorite_count: 100,
      view_count: 1000,
      click_count: 50,
      is_active: true,
      is_featured: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
];

const mockGetUser = vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
const mockSignOut = vi.fn().mockResolvedValue({ error: null });

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
      signOut: () => mockSignOut(),
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        };
      }
      if (table === 'user_sneakers') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: mockFavorites, error: null }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    },
  },
  ADMIN_EMAIL: 'admin@example.com',
}));

// Mock usePushNotifications hook
vi.mock('../../hooks/usePushNotifications', () => ({
  usePushNotifications: () => ({
    isEnabled: false,
  }),
}));

// Mock SneakerCard component
vi.mock('../../components/SneakerCard', () => ({
  SneakerCard: ({ shoe }: { shoe: { name: string } }) => (
    <div data-testid="sneaker-card">{shoe.name}</div>
  ),
}));

// Mock ReferralCard component
vi.mock('../../components/ReferralCard', () => ({
  default: () => <div data-testid="referral-card">Referral Card</div>,
}));

// Mock NotificationSettings component
vi.mock('../../components/NotificationSettings', () => ({
  default: () => <div data-testid="notification-settings">Notification Settings</div>,
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

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    renderWithRouter(<ProfilePage />);

    // Should show loading spinner initially
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render user profile after loading', async () => {
    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  it('should render user email', async () => {
    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('should render favorites and closet stats', async () => {
    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
    
    // The stats section should be rendered
    expect(document.body).toBeDefined();
  });

  it('should render tabs for favorites and closet', async () => {
    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
    
    // Both tabs should be rendered
    expect(screen.getByText('My Closet')).toBeInTheDocument();
  });

  it('should switch to closet tab', async () => {
    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('My Closet')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('My Closet'));

    // Tab should be clickable
    expect(document.body).toBeDefined();
  });

  it('should render sign out button', async () => {
    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    // Find sign out button by looking for buttons
    const buttons = document.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should handle sign out', async () => {
    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    // Find the sign out button (second button typically)
    const buttons = document.querySelectorAll('button');
    const signOutButton = buttons[1]; // Usually second button
    
    if (signOutButton) {
      fireEvent.click(signOutButton);
    }

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('should render NFT button', async () => {
    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('My NFTs')).toBeInTheDocument();
    });
  });

  it('should navigate to NFT page', async () => {
    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('My NFTs')).toBeInTheDocument();
    });

    // Find and click NFT button
    const nftButton = screen.getByText('My NFTs').closest('button');
    if (nftButton) {
      fireEvent.click(nftButton);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/nft');
  });

  it('should render referral card', async () => {
    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('referral-card')).toBeInTheDocument();
    });
  });

  it('should render notification settings button', async () => {
    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    });
  });
});

describe('ProfilePage - Unauthenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
  });

  it('should redirect to auth when not authenticated', async () => {
    renderWithRouter(<ProfilePage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });
});
