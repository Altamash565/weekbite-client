import React, { useState } from 'react';
import { WelcomeScreen } from './welcome-screen';
import { AuthFormScreen } from './auth-form-screen';

type AuthStep = 'welcome' | 'signin' | 'signup';

export const AuthNavigator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('welcome');

  if (currentStep === 'welcome') {
    return (
      <WelcomeScreen
        onNavigateToSignIn={() => setCurrentStep('signin')}
        onNavigateToSignUp={() => setCurrentStep('signup')}
      />
    );
  }

  return (
    <AuthFormScreen
      initialMode={currentStep}
      onBack={() => setCurrentStep('welcome')}
    />
  );
};
