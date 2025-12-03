import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../hooks/useOnboarding';

// Import step components
import WelcomeStep from './onboarding/WelcomeStep';
import StyleQuizStep from './onboarding/StyleQuizStep';
import BrandsStep from './onboarding/BrandsStep';
import EmailStep from './onboarding/EmailStep';
import NotificationStep from './onboarding/NotificationStep';
import CompleteStep from './onboarding/CompleteStep';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const TOTAL_STEPS = 6;

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const {
    stylePreferences,
    favoriteBrands,
    setStylePreferences,
    setFavoriteBrands,
    setEmailCaptured,
    setPushEnabled,
    completeOnboarding,
    skipOnboarding,
  } = useOnboarding();

  // Use local state for step management to avoid infinite loops
  const [step, setStep] = useState(0);
  const [localStylePreferences, setLocalStylePreferences] = useState<string[]>(stylePreferences);
  const [localFavoriteBrands, setLocalFavoriteBrands] = useState<string[]>(favoriteBrands);

  const nextStep = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const previousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleStylesChange = (styles: string[]) => {
    setLocalStylePreferences(styles);
  };

  const handleBrandsChange = (brands: string[]) => {
    setLocalFavoriteBrands(brands);
  };

  const handleSkip = () => {
    skipOnboarding();
    onComplete();
  };

  const handleComplete = () => {
    // Save preferences before completing
    setStylePreferences(localStylePreferences);
    setFavoriteBrands(localFavoriteBrands);
    completeOnboarding();
    onComplete();
  };

  // Progress dots component
  const ProgressDots = () => (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
        <motion.div
          key={index}
          initial={false}
          animate={{
            width: index === step ? 24 : 8,
            backgroundColor: index === step ? '#a855f7' : index < step ? '#a855f7' : '#3f3f46',
          }}
          transition={{ duration: 0.2 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <WelcomeStep
            onNext={nextStep}
            onSkip={handleSkip}
          />
        );
      case 1:
        return (
          <StyleQuizStep
            selectedStyles={localStylePreferences}
            onStylesChange={handleStylesChange}
            onNext={nextStep}
            onBack={previousStep}
          />
        );
      case 2:
        return (
          <BrandsStep
            selectedBrands={localFavoriteBrands}
            onBrandsChange={handleBrandsChange}
            onNext={nextStep}
            onBack={previousStep}
          />
        );
      case 3:
        return (
          <EmailStep
            onNext={nextStep}
            onBack={previousStep}
            onSkip={nextStep}
            onEmailCaptured={setEmailCaptured}
          />
        );
      case 4:
        return (
          <NotificationStep
            onNext={nextStep}
            onBack={previousStep}
            onSkip={nextStep}
            onPushEnabled={setPushEnabled}
          />
        );
      case 5:
        return (
          <CompleteStep
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-zinc-950 overflow-hidden"
    >
      {/* Safe area padding for mobile */}
      <div className="flex flex-col h-full safe-top safe-bottom">
        {/* Progress Dots - Hide on welcome and complete steps */}
        {step > 0 && step < TOTAL_STEPS - 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0"
          >
            <ProgressDots />
          </motion.div>
        )}

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="h-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default OnboardingFlow;
