import React from 'react';
import { SignUpScreen } from '../../features/auth';

interface SignUpRouteProps {
  onNavigateToSignIn?: () => void;
}

export function SignUpRoute({ onNavigateToSignIn }: SignUpRouteProps) {
  return <SignUpScreen onNavigateToSignIn={onNavigateToSignIn ?? (() => {})} />;
}

export default SignUpRoute;

