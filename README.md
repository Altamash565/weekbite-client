# WeekBite Client

> A calm, offline-resilient weekly meal compass and automated grocery planner built with **Expo (React Native)**, **Tamagui**, **NativeWind**, and **Clerk**.

---

## 🛠 Tech Stack

- **Mobile Client**: Expo SDK 58 (React Native 0.88), TypeScript (Strict)
- **Styling & UI**: Tamagui + NativeWind v4 (Tailwind CSS)
- **Typography**: Plus Jakarta Sans (`@expo-google-fonts/plus-jakarta-sans`)
- **Authentication**: Clerk Expo (`@clerk/clerk-expo`) + `expo-secure-store`
- **State Management**: Zustand (Client UI) & TanStack Query v5 (Server Cache)
- **Forms**: React Hook Form + Zod
- **Lists**: Shopify FlashList (`@shopify/flash-list`)
- **Animations**: React Native Reanimated v4
- **Monorepo**: Turborepo + `pnpm`

---

## 🚀 Getting Started

### 1. Installation
```bash
pnpm install
```

### 2. Development
```bash
# Run Mobile App (Expo)
pnpm --filter mobile start
pnpm --filter mobile android   # Android emulator/device
pnpm --filter mobile ios       # iOS simulator
```

### 3. Quality & Verification
```bash
pnpm check-types                    # Check all workspaces
pnpm --filter mobile exec tsc --noEmit # Mobile-specific TypeScript check
pnpm lint                           # Monorepo ESLint
pnpm format                         # Prettier
```

---

## 📖 System & Agent Directives

- **Universal Truth & System Invariants**: [`GEMINI.md`](GEMINI.md)
- **Visual Design Tokens & Ergonomics**: [`DESIGN.md`](DESIGN.md)
- **Tool Linking Configuration**: [`COPILOT_INSTRUCTIONS.md`](COPILOT_INSTRUCTIONS.md)
- **Progressive Disclosure Skills**: [`.geminiskills/`](.geminiskills/)

