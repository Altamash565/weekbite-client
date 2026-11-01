# Authentication Module Specification & Agent Prompt (`apps/mobile/prompts/auth.md`)

> **Domain Anchor:** Production-grade authentication for WeekBite built against the dedicated custom backend API (`/api/v1/auth/*`), utilizing httpOnly cookie/Bearer session persistence with `expo-secure-store`, TanStack Query v5, Zustand, React Hook Form, and Zod.

---

## 1. Feature Architecture & Flow

```text
apps/mobile/
├── App.tsx                                      # Root entry rendering src/app/_layout with global.css
├── app.json                                     # Native configuration (scheme: "weekbite", package name)
└── src/
    ├── app/                                     # App root routing & composition
    │   ├── _layout.tsx                          # Root layout: QueryClientProvider, AuthGate, font loader
    │   └── (auth)/                              # Shared auth route group
    │       ├── _layout.tsx                      # Auth layout hosting AuthNavigator
    │       ├── sign-in.tsx                      # Dedicated sign-in route
    │       └── sign-up.tsx                      # Dedicated sign-up route
    ├── shared/
    │   ├── api/
    │   │   └── api-client.ts                    # HTTP client with cookie persistence & 401 token refresh
    │   ├── storage/tokenCache.ts                # Hardware-secured token persistence (expo-secure-store)
    │   └── theme/tokens.ts                      # Design tokens (Plus Jakarta Sans, #32CD32, #0F2A0F)
    └── features/auth/                           # Sandboxed feature module
        ├── index.ts                             # Public feature exports
        ├── types/
        │   └── auth.types.ts                    # User, RegisterDto, LoginDto, UpdateProfileDto contracts
        ├── api/
        │   └── auth.api.ts                      # Backend endpoints (register, login, me, refresh, profile, logout)
        ├── store/
        │   └── auth.store.ts                    # Zustand client UI state (activeScreen)
        ├── hooks/
        │   └── useAuth.ts                       # TanStack Query hooks (useCurrentUser, useLogin, useRegister, useLogout)
        ├── components/
        │   ├── auth-input.tsx                   # 52px floating input with focus/error states & autofill guards
        │   └── auth-button.tsx                  # 52px primary/secondary button (#32CD32 with #0F2A0F text)
        └── screens/
            ├── sign-in-screen.tsx               # Dedicated sign-in screen (email/password, backend validation)
            ├── sign-up-screen.tsx               # Dedicated sign-up screen (name/email/password, backend register)
            └── auth-navigator.tsx               # Coordinator toggling between sign-in and sign-up
```

---

## 2. Backend API Contract (Postman Collection)

The module interfaces with the 6 backend endpoints defined in the Postman collection:

| # | Endpoint | Method | Payload / Request | Description & Headers |
|---|---|---|---|---|
| **1** | `/auth/register` | `POST` | `{ name, email, password }` | Registers account. Returns user info upon success. |
| **2** | `/auth/login` | `POST` | `{ email, password }` | Authenticates user. Returns user profile, sets `accessToken` & `refreshToken`. |
| **3** | `/auth/me` | `GET` | *None* | Fetches active user profile using session cookie/token. |
| **4** | `/auth/refresh` | `POST` | *None* | Exchanges `refreshToken` for new `accessToken` and `refreshToken`. |
| **5** | `/auth/profile` | `PATCH` | `{ name?, avatar? }` | Updates profile name and/or avatar for authenticated user. |
| **6** | `/auth/logout` | `POST` | *None* | Invalidates refresh token on server and clears client session storage. |

---

## 3. Invariants & Strict Rules

1. **Zero Mock Data (Strict Real Backend Operations)**:
   - **FORBIDDEN**: Mock users, dummy session tokens, fake timer delays, or simulated auth handlers.
   - **REQUIRED**: All authentication operations (`useLogin`, `useRegister`, `useCurrentUser`, `useLogout`) connect directly to the backend API (`EXPO_PUBLIC_API_URL`).

2. **Session & Cookie Persistence on Mobile**:
   - The API client (`src/shared/api/api-client.ts`) handles incoming cookies (`set-cookie` header and response payloads) and persists `accessToken` and `refreshToken` into `expo-secure-store`.
   - Outgoing requests include `credentials: 'include'`, `Cookie` headers, and `Authorization: Bearer <accessToken>`.
   - On `401 Unauthorized`, the client automatically calls `/auth/refresh`, updates the tokens, and retries the original request.

3. **Autofill Guarding (Zero Field Bleed)**:
   - The `Full name` field on Sign Up uses `importantForAutofill="no"`, `autoComplete="name"`, and `textContentType="name"` so that OS credential managers never inject email addresses into the name box.
   - `Email address` explicitly specifies `importantForAutofill="yes"`, `autoComplete="email"`, and `textContentType="emailAddress"`.
   - `Password` uses `importantForAutofill="yes"`, `autoComplete="new-password"` / `"current-password"`, and `textContentType="newPassword"` / `"password"`.

4. **Strict Design System Compliance** ([`DESIGN.md`](../../DESIGN.md)):
   - **Primary Action**: `#32CD32` background with `#0F2A0F` dark green text (never white).
   - **Typography**: `Plus Jakarta Sans` (`400`, `500`, `600`, `700`).
   - **Touch Targets**: Minimum 48x48pt hit targets with `hitSlop` on all pressables.

---

## 4. Environment Configuration

In `apps/mobile/.env`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
```

> **Note for Physical Device / Expo Go:** When testing on a real phone via Wi-Fi, change `localhost` to your computer's local network IP address (e.g. `http://192.168.1.100:5000/api/v1`).

---

## 5. Verification & Testing Recipe

Run mobile-isolated TypeScript validation:
```bash
pnpm --filter mobile exec tsc --noEmit
```

Run monorepo validation across all packages:
```bash
pnpm check-types
```
