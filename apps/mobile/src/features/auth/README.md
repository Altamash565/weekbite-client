# Authentication Module Specification (`features/auth`) — Powered by Clerk

**Calm Culinary Minimal** — Production-grade authentication specification using **Clerk Expo** (`@clerk/clerk-expo`) and **`expo-secure-store`**, styled with WeekBite's custom native design system.

---

## 1. Architecture & Why Clerk?

Instead of maintaining a custom auth server with roll-your-own JWTs, session refreshes, and OAuth handshakes, WeekBite uses **Clerk** as its identity and authentication provider:

- **Hardware-Backed Session Security:** Automatic JWT rotation cached securely in `expo-secure-store`.
- **Headless UI:** We use Clerk's React Native hooks (`useSignIn`, `useSignUp`, `useOAuth`, `useUser`) while rendering our custom **Calm Culinary Minimal** components.
- **Native Social OAuth:** Seamless one-tap Google and Apple sign-in with `expo-web-browser`.
- **Passwordless Verification:** Built-in email OTP verification for new accounts.

---

## 2. File & Directory Blueprint

```text
apps/mobile/src/features/auth/
├── README.md                      # This specification document
├── index.ts                       # Public feature exports (AuthScreen, useAuthSession)
├── types/
│   └── index.ts                   # Auth form schemas, Zod validation, Clerk error types
├── hooks/
│   ├── useClerkSignIn.ts          # Wraps Clerk's `useSignIn` with custom validation & loading state
│   ├── useClerkSignUp.ts          # Wraps Clerk's `useSignUp` with OTP verification step
│   └── useSocialAuth.ts           # Wraps Clerk's `useOAuth` for Google and Apple
├── components/
│   ├── AuthHeader.tsx             # 24px squircle logo, "WeekBite" title, and calm subtitle
│   ├── AuthModeTabs.tsx           # Segmented pill: "Sign In" vs "Create Account"
│   ├── AuthInput.tsx              # 48px height, 1px border, password visibility toggle
│   ├── SocialAuthButtons.tsx      # Google & Apple sign-in triggers via `useSocialAuth`
│   ├── VerificationModal.tsx      # 6-digit OTP modal for email verification on Sign Up
│   └── ForgotPasswordModal.tsx    # Password reset code verification modal
└── screens/
    └── AuthScreen.tsx             # Composed view with <SafeAreaView> & <KeyboardAvoidingView>
```

---

## 3. Global Clerk Provider Setup (`src/app/_layout.tsx`)

Clerk requires a secure token cache to persist user sessions across app reboots:

### Token Cache Service (`src/shared/storage/tokenCache.ts`)
```typescript
import * as SecureStore from 'expo-secure-store';

export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Error handling
    }
  },
  async clearToken(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Error handling
    }
  },
};
```

### Root Layout (`src/app/_layout.tsx`)
```tsx
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { tokenCache } from '@/shared/storage/tokenCache';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in environment variables');
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <Slot />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
```

---

## 4. Clerk Hook Workflows

### A. Sign In Flow (`useClerkSignIn.ts`)
```typescript
import { useSignIn } from '@clerk/clerk-expo';

export function useClerkSignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();

  const handleSignIn = async (email: string, password: string) => {
    if (!isLoaded) return;

    const result = await signIn.create({
      identifier: email,
      password,
    });

    if (result.status === 'complete') {
      await setActive({ session: result.createdSessionId });
      // Expo Router automatically redirects to (tabs)/compass
    }
  };

  return { handleSignIn, isLoaded };
}
```

### B. Sign Up Flow with OTP Verification (`useClerkSignUp.ts`)
```typescript
import { useSignUp } from '@clerk/clerk-expo';
import { useState } from 'react';

export function useClerkSignUp() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [pendingVerification, setPendingVerification] = useState(false);

  const startSignUp = async (email: string, password: string, fullName: string) => {
    if (!isLoaded) return;

    await signUp.create({
      emailAddress: email,
      password,
      firstName: fullName.split(' ')[0],
      lastName: fullName.split(' ').slice(1).join(' ') || undefined,
    });

    // Send email OTP code
    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    setPendingVerification(true);
  };

  const confirmVerification = async (code: string) => {
    if (!isLoaded) return;

    const result = await signUp.attemptEmailAddressVerification({ code });

    if (result.status === 'complete') {
      await setActive({ session: result.createdSessionId });
    }
  };

  return { startSignUp, confirmVerification, pendingVerification, isLoaded };
}
```

### C. Social OAuth (Google & Apple) (`useSocialAuth.ts`)
```typescript
import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export function useSocialAuth() {
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: 'oauth_apple' });

  const signInWithGoogle = async () => {
    const { createdSessionId, setActive } = await startGoogleFlow();
    if (createdSessionId && setActive) {
      await setActive({ session: createdSessionId });
    }
  };

  const signInWithApple = async () => {
    const { createdSessionId, setActive } = await startAppleFlow();
    if (createdSessionId && setActive) {
      await setActive({ session: createdSessionId });
    }
  };

  return { signInWithGoogle, signInWithApple };
}
```

---

## 5. Design System Alignment (Calm Culinary Minimal)

All UI components wrap Clerk's logic in custom React Native primitives styled strictly with [`tokens.ts`](../../shared/theme/tokens.ts):

| UI Element | Design Token / Value | Rule |
| :--- | :--- | :--- |
| **Canvas** | `colors.background` (`#F8FAF7`) | Zero visual noise, soft organic tint |
| **Card / Box** | `colors.surface` (`#FFFFFF`) | Crisp 1px border (`#E6EAE4`), **no drop shadows** |
| **Primary CTA** | `colors.primary` (`#32CD32`) | **Text must be `#0F2A0F` (Dark Green, never white)** |
| **Secondary Buttons**| `colors.surface` (`#FFFFFF`) | 1px border (`#E6EAE4`), `#1B1F1B` text, 48px height |
| **Inputs** | 48px height, `radii.input` (12px) | Focus state: `colors.primaryDark` (`#1F8A1F`) |
| **Error Feedback** | `colors.error` (`#D64545`) | Display Clerk's friendly error message below the field |
| **Touch Targets** | Minimum `44px × 44px` | Complies with mobile kitchen ergonomics |

---

## 6. Environment Variables

Create `.env` inside `apps/mobile/` (and add `.env*` to `.gitignore`):

```bash
# Clerk Public API Key (find in Clerk Dashboard > API Keys)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## 7. Step-by-Step Implementation Checklist

- [ ] **Step 1: Install Clerk dependencies** in `apps/mobile`:
  ```bash
  pnpm --filter mobile add @clerk/clerk-expo
  npx expo install expo-secure-store expo-web-browser
  ```
- [ ] **Step 2: Add Clerk publishable key** to `apps/mobile/.env`.
- [ ] **Step 3: Implement `tokenCache.ts`** in `src/shared/storage/tokenCache.ts`.
- [ ] **Step 4: Wrap root app** with `<ClerkProvider>` in `src/app/_layout.tsx`.
- [ ] **Step 5: Create custom auth components**:
  - `AuthHeader.tsx` (Logo squircle + Lexend title)
  - `AuthModeTabs.tsx` (Sign In / Sign Up switch)
  - `SocialAuthButtons.tsx` (Google & Apple)
  - `VerificationModal.tsx` (Email OTP code input)
- [ ] **Step 6: Build `AuthScreen.tsx`** connecting `useClerkSignIn`, `useClerkSignUp`, and `useSocialAuth`.
- [ ] **Step 7: Add authentication redirect guard** in `src/app/_layout.tsx` using `useAuth()`.
- [ ] **Step 8: Verify type safety** with `npx tsc --noEmit`.
