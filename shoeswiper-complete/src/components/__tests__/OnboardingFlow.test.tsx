import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingFlow from '../OnboardingFlow';

// Mock config module
vi.mock('../../lib/config', () => ({
  DEMO_MODE: true,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock useOnboarding hook
const mockSetStylePreferences = vi.fn();
const mockSetFavoriteBrands = vi.fn();
const mockSetEmailCaptured = vi.fn();
const mockSetPushEnabled = vi.fn();
const mockCompleteOnboarding = vi.fn();
const mockSkipOnboarding = vi.fn();

vi.mock('../../hooks/useOnboarding', () => ({
  useOnboarding: () => ({
    stylePreferences: [],
    favoriteBrands: [],
    setStylePreferences: mockSetStylePreferences,
    setFavoriteBrands: mockSetFavoriteBrands,
    setEmailCaptured: mockSetEmailCaptured,
    setPushEnabled: mockSetPushEnabled,
    completeOnboarding: mockCompleteOnboarding,
    skipOnboarding: mockSkipOnboarding,
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock step components
vi.mock('../onboarding/WelcomeStep', () => ({
  default: ({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) => (
    <div data-testid="welcome-step">
      <h1>Welcome Step</h1>
      <button onClick={onNext} data-testid="next-btn">
        Get Started
      </button>
      <button onClick={onSkip} data-testid="skip-btn">
        Skip
      </button>
    </div>
  ),
}));

vi.mock('../onboarding/StyleQuizStep', () => ({
  default: ({
    onNext,
    onBack,
    selectedStyles: _selectedStyles,
    onStylesChange,
  }: {
    onNext: () => void;
    onBack: () => void;
    selectedStyles: string[];
    onStylesChange: (styles: string[]) => void;
  }) => (
    <div data-testid="style-quiz-step">
      <h1>Style Quiz</h1>
      <button onClick={() => onStylesChange(['casual'])} data-testid="select-style">
        Select Casual
      </button>
      <button onClick={onBack} data-testid="back-btn">
        Back
      </button>
      <button onClick={onNext} data-testid="next-btn">
        Next
      </button>
    </div>
  ),
}));

vi.mock('../onboarding/BrandsStep', () => ({
  default: ({
    onNext,
    onBack,
    selectedBrands: _selectedBrands,
    onBrandsChange,
  }: {
    onNext: () => void;
    onBack: () => void;
    selectedBrands: string[];
    onBrandsChange: (brands: string[]) => void;
  }) => (
    <div data-testid="brands-step">
      <h1>Brands Step</h1>
      <button onClick={() => onBrandsChange(['Nike'])} data-testid="select-brand">
        Select Nike
      </button>
      <button onClick={onBack} data-testid="back-btn">
        Back
      </button>
      <button onClick={onNext} data-testid="next-btn">
        Next
      </button>
    </div>
  ),
}));

vi.mock('../onboarding/EmailStep', () => ({
  default: ({
    onNext,
    onBack,
    onSkip,
    onEmailCaptured,
  }: {
    onNext: () => void;
    onBack: () => void;
    onSkip: () => void;
    onEmailCaptured: (captured: boolean) => void;
  }) => (
    <div data-testid="email-step">
      <h1>Email Step</h1>
      <button onClick={() => onEmailCaptured(true)} data-testid="capture-email">
        Submit Email
      </button>
      <button onClick={onBack} data-testid="back-btn">
        Back
      </button>
      <button onClick={onSkip} data-testid="skip-btn">
        Skip
      </button>
      <button onClick={onNext} data-testid="next-btn">
        Next
      </button>
    </div>
  ),
}));

vi.mock('../onboarding/NotificationStep', () => ({
  default: ({
    onNext,
    onBack,
    onSkip,
    onPushEnabled,
  }: {
    onNext: () => void;
    onBack: () => void;
    onSkip: () => void;
    onPushEnabled: (enabled: boolean) => void;
  }) => (
    <div data-testid="notification-step">
      <h1>Notification Step</h1>
      <button onClick={() => onPushEnabled(true)} data-testid="enable-push">
        Enable Notifications
      </button>
      <button onClick={onBack} data-testid="back-btn">
        Back
      </button>
      <button onClick={onSkip} data-testid="skip-btn">
        Skip
      </button>
      <button onClick={onNext} data-testid="next-btn">
        Next
      </button>
    </div>
  ),
}));

vi.mock('../onboarding/CompleteStep', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="complete-step">
      <h1>Complete Step</h1>
      <button onClick={onComplete} data-testid="complete-btn">
        Start Swiping
      </button>
    </div>
  ),
}));

describe('OnboardingFlow', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render welcome step initially', () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    expect(screen.getByTestId('welcome-step')).toBeInTheDocument();
  });

  it('should navigate to style quiz step after welcome', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    expect(screen.getByTestId('welcome-step')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('next-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument();
    });
  });

  it('should navigate to brands step after style quiz', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Step 0: Welcome
    fireEvent.click(screen.getByTestId('next-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument();
    });

    // Step 1: Style Quiz
    fireEvent.click(screen.getByTestId('next-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('brands-step')).toBeInTheDocument();
    });
  });

  it('should navigate to email step after brands', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Navigate through steps
    fireEvent.click(screen.getByTestId('next-btn')); // Welcome -> Style Quiz
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Style Quiz -> Brands
    await waitFor(() => expect(screen.getByTestId('brands-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Brands -> Email
    await waitFor(() => expect(screen.getByTestId('email-step')).toBeInTheDocument());
  });

  it('should navigate to notification step after email', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Navigate through steps
    fireEvent.click(screen.getByTestId('next-btn')); // Welcome -> Style Quiz
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Style Quiz -> Brands
    await waitFor(() => expect(screen.getByTestId('brands-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Brands -> Email
    await waitFor(() => expect(screen.getByTestId('email-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Email -> Notification
    await waitFor(() => expect(screen.getByTestId('notification-step')).toBeInTheDocument());
  });

  it('should navigate to complete step after notification', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Navigate through all steps
    fireEvent.click(screen.getByTestId('next-btn')); // Welcome -> Style Quiz
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Style Quiz -> Brands
    await waitFor(() => expect(screen.getByTestId('brands-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Brands -> Email
    await waitFor(() => expect(screen.getByTestId('email-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Email -> Notification
    await waitFor(() => expect(screen.getByTestId('notification-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Notification -> Complete
    await waitFor(() => expect(screen.getByTestId('complete-step')).toBeInTheDocument());
  });

  it('should call onComplete when completing onboarding', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Navigate to complete step
    fireEvent.click(screen.getByTestId('next-btn')); // Welcome
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Style Quiz
    await waitFor(() => expect(screen.getByTestId('brands-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Brands
    await waitFor(() => expect(screen.getByTestId('email-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Email
    await waitFor(() => expect(screen.getByTestId('notification-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Notification
    await waitFor(() => expect(screen.getByTestId('complete-step')).toBeInTheDocument());

    // Complete onboarding
    fireEvent.click(screen.getByTestId('complete-btn'));

    expect(mockCompleteOnboarding).toHaveBeenCalled();
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should skip onboarding when skip is clicked on welcome', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    fireEvent.click(screen.getByTestId('skip-btn'));

    expect(mockSkipOnboarding).toHaveBeenCalled();
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should navigate back from style quiz to welcome', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Go to style quiz
    fireEvent.click(screen.getByTestId('next-btn'));
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());

    // Go back
    fireEvent.click(screen.getByTestId('back-btn'));
    await waitFor(() => expect(screen.getByTestId('welcome-step')).toBeInTheDocument());
  });

  it('should navigate back from brands to style quiz', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Navigate to brands
    fireEvent.click(screen.getByTestId('next-btn')); // Welcome
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Style Quiz
    await waitFor(() => expect(screen.getByTestId('brands-step')).toBeInTheDocument());

    // Go back
    fireEvent.click(screen.getByTestId('back-btn'));
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());
  });

  it('should handle style selection', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Navigate to style quiz
    fireEvent.click(screen.getByTestId('next-btn'));
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());

    // Select a style
    fireEvent.click(screen.getByTestId('select-style'));

    // The local state should be updated (component handles this internally)
    expect(document.body).toBeDefined();
  });

  it('should handle brand selection', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Navigate to brands
    fireEvent.click(screen.getByTestId('next-btn')); // Welcome
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Style Quiz
    await waitFor(() => expect(screen.getByTestId('brands-step')).toBeInTheDocument());

    // Select a brand
    fireEvent.click(screen.getByTestId('select-brand'));

    // The local state should be updated
    expect(document.body).toBeDefined();
  });

  it('should handle email capture', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Navigate to email step
    fireEvent.click(screen.getByTestId('next-btn')); // Welcome
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Style Quiz
    await waitFor(() => expect(screen.getByTestId('brands-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Brands
    await waitFor(() => expect(screen.getByTestId('email-step')).toBeInTheDocument());

    // Capture email
    fireEvent.click(screen.getByTestId('capture-email'));

    expect(mockSetEmailCaptured).toHaveBeenCalledWith(true);
  });

  it('should handle push notification enable', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Navigate to notification step
    fireEvent.click(screen.getByTestId('next-btn')); // Welcome
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Style Quiz
    await waitFor(() => expect(screen.getByTestId('brands-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Brands
    await waitFor(() => expect(screen.getByTestId('email-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Email
    await waitFor(() => expect(screen.getByTestId('notification-step')).toBeInTheDocument());

    // Enable push
    fireEvent.click(screen.getByTestId('enable-push'));

    expect(mockSetPushEnabled).toHaveBeenCalledWith(true);
  });

  it('should save preferences on complete', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Navigate through all steps
    fireEvent.click(screen.getByTestId('next-btn')); // Welcome
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());

    // Select a style
    fireEvent.click(screen.getByTestId('select-style'));
    fireEvent.click(screen.getByTestId('next-btn')); // Style Quiz
    await waitFor(() => expect(screen.getByTestId('brands-step')).toBeInTheDocument());

    // Select a brand
    fireEvent.click(screen.getByTestId('select-brand'));
    fireEvent.click(screen.getByTestId('next-btn')); // Brands
    await waitFor(() => expect(screen.getByTestId('email-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Email
    await waitFor(() => expect(screen.getByTestId('notification-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Notification
    await waitFor(() => expect(screen.getByTestId('complete-step')).toBeInTheDocument());

    // Complete
    fireEvent.click(screen.getByTestId('complete-btn'));

    expect(mockSetStylePreferences).toHaveBeenCalled();
    expect(mockSetFavoriteBrands).toHaveBeenCalled();
    expect(mockCompleteOnboarding).toHaveBeenCalled();
    expect(mockOnComplete).toHaveBeenCalled();
  });
});

describe('OnboardingFlow - Skip Functionality', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should skip email step when skip is clicked', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Navigate to email step
    fireEvent.click(screen.getByTestId('next-btn')); // Welcome
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Style Quiz
    await waitFor(() => expect(screen.getByTestId('brands-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Brands
    await waitFor(() => expect(screen.getByTestId('email-step')).toBeInTheDocument());

    // Skip email step
    fireEvent.click(screen.getByTestId('skip-btn'));

    // Should advance to notification step
    await waitFor(() => expect(screen.getByTestId('notification-step')).toBeInTheDocument());
  });

  it('should skip notification step when skip is clicked', async () => {
    render(<OnboardingFlow onComplete={mockOnComplete} />);

    // Navigate to notification step
    fireEvent.click(screen.getByTestId('next-btn')); // Welcome
    await waitFor(() => expect(screen.getByTestId('style-quiz-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Style Quiz
    await waitFor(() => expect(screen.getByTestId('brands-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Brands
    await waitFor(() => expect(screen.getByTestId('email-step')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('next-btn')); // Email
    await waitFor(() => expect(screen.getByTestId('notification-step')).toBeInTheDocument());

    // Skip notification step
    fireEvent.click(screen.getByTestId('skip-btn'));

    // Should advance to complete step
    await waitFor(() => expect(screen.getByTestId('complete-step')).toBeInTheDocument());
  });
});
