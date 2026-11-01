import React, { useState } from 'react';
import { SignInScreen } from './sign-in-screen';
import { SignUpScreen } from './sign-up-screen';

type AuthViewMode = 'sign-in' | 'sign-up';

interface AuthNavigatorProps {
  initialMode?: AuthViewMode;
}

export const AuthNavigator: React.FC<AuthNavigatorProps> = ({ initialMode = 'sign-in' }) => {
  const [mode, setMode] = useState<AuthViewMode>(initialMode);

  if (mode === 'sign-up') {
    return <SignUpScreen onNavigateToSignIn={() => setMode('sign-in')} />;
  }

  return <SignInScreen onNavigateToSignUp={() => setMode('sign-up')} />;
};

