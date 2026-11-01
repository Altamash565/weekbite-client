import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useOAuth } from '@clerk/clerk-expo';
import { useCallback, useEffect } from 'react';

// Initialize WebBrowser handler for native OAuth redirects
WebBrowser.maybeCompleteAuthSession();

export function useWarmUpBrowser() {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

export function useClerkOAuth(strategy: 'oauth_google' | 'oauth_apple') {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy });

  const signInWithOAuth = useCallback(async () => {
    try {
      // Use expo-auth-session makeRedirectUri:
      // In Expo Go: resolves to exp://... (pre-configured for dev instances)
      // In standalone builds: resolves to weekbite://oauth-native-callback
      const redirectUrl = AuthSession.makeRedirectUri({
        path: 'oauth-native-callback',
      });

      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        return { success: true, error: null };
      }

      if (signIn?.createdSessionId && setActive) {
        await setActive({ session: signIn.createdSessionId });
        return { success: true, error: null };
      }

      if (signUp?.createdSessionId && setActive) {
        await setActive({ session: signUp.createdSessionId });
        return { success: true, error: null };
      }

      return { success: false, error: 'OAuth session not completed' };
    } catch (err: unknown) {
      const clerkError = err as {
        errors?: Array<{ message: string; longMessage?: string; code?: string }>;
        message?: string;
      };
      const errorMessage =
        clerkError?.errors?.[0]?.longMessage ||
        clerkError?.errors?.[0]?.message ||
        clerkError?.message ||
        'Authentication failed';
      return { success: false, error: errorMessage };
    }
  }, [startOAuthFlow]);

  return { signInWithOAuth };
}
