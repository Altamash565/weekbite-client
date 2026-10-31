# GEMINI.md — Universal System Context & Technical Truth

> **Project Anchor:** WeekBite is an offline-resilient, calm weekly meal compass and automated grocery planner built for iOS and Android using Expo, Tamagui, NativeWind, and Clerk.

---

## 1. Technical Stack & Architecture

| Layer | Technology | Primary Role / Package |
| :--- | :--- | :--- |
| **Framework & Runtime** | React Native 0.88+, Expo SDK 58 | Mobile application core (`apps/mobile`) |
| **Language** | TypeScript 5+ (Strict Mode) | Zero-any policy across all workspaces |
| **Monorepo Engine** | Turborepo + pnpm 11+ | Task pipelining (`apps/*`, `packages/*`) |
| **Styling** | NativeWind v4 (Tailwind CSS) | Atomic utility classes for React Native |
| **UI Primitive System** | Tamagui | Headless, typed cross-platform primitives |
| **Typography** | Plus Jakarta Sans | `@expo-google-fonts/plus-jakarta-sans` |
| **Authentication** | Clerk Expo (`@clerk/clerk-expo`) | Hardware-secured JWT auth via `expo-secure-store` |
| **State Management** | Zustand | Client UI state (filter toggles, active sheet) |
| **Server State & Data** | TanStack Query v5 (`@tanstack/react-query`) | Cache management, optimistic mutations, offline sync |
| **Forms & Validation** | React Hook Form + Zod | Schema-first form state & instant error messaging |
| **List Virtualization** | Shopify FlashList (`@shopify/flash-list`) | High-performance recycling lists with `estimatedItemSize` |
| **Animations** | React Native Reanimated v4 | 60/120fps declarative gesture animations |

---

## 2. Deterministic Command Reference

Execute all commands from the repository root using `pnpm`:

```bash
# Workspace Setup
pnpm install

# Mobile Development (Expo)
pnpm --filter mobile start          # Start Expo dev server
pnpm --filter mobile android        # Launch on Android emulator/device
pnpm --filter mobile ios            # Launch on iOS simulator

# Verification & Quality Control
pnpm check-types                    # Type check all workspaces via Turborepo
pnpm --filter mobile exec tsc --noEmit # Mobile-isolated strict TypeScript validation
pnpm lint                           # ESLint validation across monorepo
pnpm format                         # Prettier code formatting
```

---

## 3. High-Leverage Architectural Invariants (NEVER Break)

1. **Strict Native Primitives Only**:
   - **FORBIDDEN**: Web DOM tags (`<div>`, `<span>`, `<p>`, `<h1>`, `<button>`, `<input>`, `<a>`, `<section>`) or raw CSS strings in `apps/mobile`.
   - **REQUIRED**: Tamagui components or React Native primitives (`View`, `Text`, `Pressable`, `TextInput`) styled with NativeWind classes or design tokens.
2. **Feature-Driven Isolation**:
   - `src/features/<domain>/` (`auth`, `meals`, `groceries`, `recipes`, `profile`) is strictly sandboxed.
   - A feature **must NEVER** import from another feature's internal directories (e.g., `features/meals` importing from `features/groceries/components`).
   - Cross-domain components, utilities, and hooks must be elevated to `src/shared/`.
3. **Server vs. Client State Separation**:
   - Server data lives **exclusively** in TanStack Query queries and mutations. Do **NOT** duplicate API responses in Zustand stores.
   - Zustand stores are reserved solely for ephemeral client state (e.g., drawer visibility, UI step index, offline queue flags).
4. **Virtualization & Touch Ergonomics**:
   - Every dynamic list with more than 10 items must use `@shopify/flash-list` with a defined `estimatedItemSize`. Never use un-virtualized `.map()` or legacy `ScrollView` for collections.
   - All interactive controls must satisfy minimum **48x48pt** touch targets (`hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` when visual size is smaller).
   - Top-level screens must consume safe areas (`useSafeAreaInsets` or `SafeAreaView`) and wrap inputs in `KeyboardAvoidingView`.
5. **Secure Token Storage**:
   - Clerk session tokens and API secrets must use `expo-secure-store` via `tokenCache`. Plain `AsyncStorage` or unencrypted storage for sensitive credentials is strictly prohibited.

---

## 4. Self-Correction & Verification Directive

> **MANDATORY PRE-COMPLETION ROUTINE:**
> Before proposing code changes or completing any task, you must automatically execute:
> ```bash
> pnpm --filter mobile exec tsc --noEmit
> ```
> If TypeScript outputs errors, parse the diagnostic stack, fix the root cause, and re-run the check until **0 errors** are reported. Never suppress errors with `@ts-ignore` or `any`.

