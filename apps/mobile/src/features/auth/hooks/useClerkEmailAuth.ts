import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useCallback, useState } from 'react';

export function useClerkEmailAuth() {
  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationType, setVerificationType] = useState<'sign-in' | 'sign-up' | null>(null);
  const [targetEmail, setTargetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const extractErrorMessage = (err: unknown, fallback: string): string => {
    const clerkErr = err as {
      errors?: Array<{ message: string; longMessage?: string; code?: string }>;
      message?: string;
    };
    return (
      clerkErr?.errors?.[0]?.longMessage ||
      clerkErr?.errors?.[0]?.message ||
      clerkErr?.message ||
      fallback
    );
  };

  /**
   * Sign In with Email + Password, with automatic fallback to OTP if 2FA or code is required
   */
  const loginWithEmail = useCallback(
    async (email: string, password?: string) => {
      if (!isSignInLoaded || !signIn) return { success: false, error: 'Auth not initialized' };
      setLoading(true);
      setAuthError(null);
      setTargetEmail(email.trim());

      try {
        const createParams: { identifier: string; password?: string } = {
          identifier: email.trim(),
        };
        if (password) {
          createParams.password = password;
        }

        const result = await signIn.create(createParams);

        if (result.status === 'complete' && result.createdSessionId) {
          if (setSignInActive) {
            await setSignInActive({ session: result.createdSessionId });
          }
          setLoading(false);
          return { success: true, error: null };
        }

        // If email code or second factor is required
        if (result.status === 'needs_first_factor') {
          const emailCodeFactor = result.supportedFirstFactors?.find(
            (factor) => factor.strategy === 'email_code'
          );

          if (emailCodeFactor && 'emailAddressId' in emailCodeFactor) {
            await signIn.prepareFirstFactor({
              strategy: 'email_code',
              emailAddressId: emailCodeFactor.emailAddressId,
            });
            setPendingVerification(true);
            setVerificationType('sign-in');
            setLoading(false);
            return { success: true, pendingVerification: true, error: null };
          }
        }

        if (result.status === 'needs_second_factor') {
          const secondFactor = result.supportedSecondFactors?.find(
            (factor) => factor.strategy === 'phone_code' || factor.strategy === 'totp'
          );
          if (secondFactor) {
            setPendingVerification(true);
            setVerificationType('sign-in');
            setLoading(false);
            return { success: true, pendingVerification: true, error: null };
          }
        }

        setLoading(false);
        const err = `Sign in status: ${result.status}. Please complete authentication.`;
        setAuthError(err);
        return { success: false, error: err };
      } catch (err: unknown) {
        setLoading(false);
        const message = extractErrorMessage(err, 'Failed to sign in');
        setAuthError(message);
        return { success: false, error: message };
      }
    },
    [isSignInLoaded, signIn, setSignInActive]
  );

  /**
   * Verify Sign In OTP (when 2FA or email code is required on login)
   */
  const verifySignInOtp = useCallback(
    async (code: string) => {
      if (!isSignInLoaded || !signIn) return { success: false, error: 'Auth not initialized' };
      setLoading(true);
      setAuthError(null);

      try {
        const result = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: code.trim(),
        });

        if (result.status === 'complete' && result.createdSessionId) {
          if (setSignInActive) {
            await setSignInActive({ session: result.createdSessionId });
          }
          setPendingVerification(false);
          setVerificationType(null);
          setLoading(false);
          return { success: true, error: null };
        } else {
          setLoading(false);
          const err = `Sign in status: ${result.status}. Verification not completed.`;
          setAuthError(err);
          return { success: false, error: err };
        }
      } catch (err: unknown) {
        setLoading(false);
        const message = extractErrorMessage(err, 'Verification code is invalid');
        setAuthError(message);
        return { success: false, error: message };
      }
    },
    [isSignInLoaded, signIn, setSignInActive]
  );

  /**
   * Register with Email, Password, and Full Name, then prepare email code OTP
   */
  const registerWithEmail = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (!isSignUpLoaded || !signUp) return { success: false, error: 'Auth not initialized' };
      setLoading(true);
      setAuthError(null);
      setTargetEmail(email.trim());

      try {
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || undefined;

        await signUp.create({
          emailAddress: email.trim(),
          password,
          firstName,
          lastName,
        });

        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
        setVerificationType('sign-up');
        setLoading(false);
        return { success: true, pendingVerification: true, error: null };
      } catch (err: unknown) {
        setLoading(false);
        const message = extractErrorMessage(err, 'Failed to create account');
        setAuthError(message);
        return { success: false, error: message };
      }
    },
    [isSignUpLoaded, signUp]
  );

  /**
   * Verify Sign Up OTP (email code)
   */
  const verifySignUpOtp = useCallback(
    async (code: string) => {
      if (!isSignUpLoaded || !signUp) return { success: false, error: 'Auth not initialized' };
      setLoading(true);
      setAuthError(null);

      try {
        const result = await signUp.attemptEmailAddressVerification({
          code: code.trim(),
        });

        if (result.status === 'complete' && result.createdSessionId) {
          if (setSignUpActive) {
            await setSignUpActive({ session: result.createdSessionId });
          }
          setPendingVerification(false);
          setVerificationType(null);
          setLoading(false);
          return { success: true, error: null };
        } else if (result.status === 'missing_requirements') {
          // If session is already created despite missing optional fields
          if (result.createdSessionId && setSignUpActive) {
            await setSignUpActive({ session: result.createdSessionId });
            setPendingVerification(false);
            setVerificationType(null);
            setLoading(false);
            return { success: true, error: null };
          }
          setLoading(false);
          const missing = result.missingFields?.join(', ') || 'required fields';
          const err = `Account created, but missing: ${missing}.`;
          setAuthError(err);
          return { success: false, error: err };
        } else {
          setLoading(false);
          const err = 'Verification could not be completed';
          setAuthError(err);
          return { success: false, error: err };
        }
      } catch (err: unknown) {
        setLoading(false);
        const message = extractErrorMessage(err, 'Verification code is invalid');
        setAuthError(message);
        return { success: false, error: message };
      }
    },
    [isSignUpLoaded, signUp, setSignUpActive]
  );

  /**
   * Resend OTP code for sign up or sign in
   */
  const resendOtp = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      if (verificationType === 'sign-up' && signUp) {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      } else if (verificationType === 'sign-in' && signIn) {
        const emailCodeFactor = signIn.supportedFirstFactors?.find(
          (factor) => factor.strategy === 'email_code'
        );
        if (emailCodeFactor && 'emailAddressId' in emailCodeFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });
        }
      }
      setLoading(false);
      return { success: true, error: null };
    } catch (err: unknown) {
      setLoading(false);
      const message = extractErrorMessage(err, 'Failed to resend code');
      setAuthError(message);
      return { success: false, error: message };
    }
  }, [verificationType, signUp, signIn]);

  const resetVerification = useCallback(() => {
    setPendingVerification(false);
    setVerificationType(null);
    setAuthError(null);
  }, []);

  return {
    loginWithEmail,
    verifySignInOtp,
    registerWithEmail,
    verifySignUpOtp,
    resendOtp,
    resetVerification,
    pendingVerification,
    verificationType,
    targetEmail,
    loading,
    authError,
    setAuthError,
  };
}
