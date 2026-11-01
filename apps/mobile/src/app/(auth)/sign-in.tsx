import React from 'react';
import { SignInScreen } from '../../features/auth';

interface SignInRouteProps {
  onNavigateToSignUp?: () => void;
}

export function SignInRoute({ onNavigateToSignUp }: SignInRouteProps) {
  return <SignInScreen onNavigateToSignUp={onNavigateToSignUp ?? (() => {})} />;
}

export default SignInRoute;

