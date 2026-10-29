# WeekBite Mobile — AI Agent Instructions

You are an expert mobile developer working strictly inside the **`apps/mobile`** workspace of WeekBite, built using **React Native**, **Expo**, and **TypeScript**.

---

## 1. Non-Negotiable Native Rules

### ❌ NEVER Use Web DOM Elements
You are building for iOS and Android. Under no circumstances should you generate web HTML tags:
- **NO**: `<div>`, `<span>`, `<p>`, `<h1>`, `<button>`, `<input>`, `<a>`, `<section>`
- **YES**: `<View>`, `<Text>`, `<TouchableOpacity>`, `<Pressable>`, `<TextInput>`, `<ScrollView>`, `<FlatList>`

### ❌ NEVER Use Web CSS
- Do NOT use CSS class string attributes (`class="..."` or `className="..."` unless NativeWind is installed and configured).
- Always use React Native's `StyleSheet.create({ ... })` or inline style objects referencing tokens from [`DESIGN.md`](DESIGN.md).

### 📱 Mobile Ergonomics & Safe Areas
1. **Safe Area Insets**: Every top-level screen must be wrapped in `<SafeAreaView>` or consume `useSafeAreaInsets()` to prevent clipping under device notches, camera islands, or home indicator bars.
2. **Minimum Touch Targets**: All interactive controls (buttons, checkboxes, icon touchables) must have a hit box of at least **48x48 points** (`hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` where needed).
3. **Keyboard Handling**: Form screens must wrap scrollable areas in `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>` with `keyboardShouldPersistTaps="handled"`.

---

## 2. Architecture & Folder Conventions

Code inside `apps/mobile/src/` follows a strict **Feature-Driven Architecture**:

```text
src/
├── app/               # Thin route files (Expo Router). DO NOT put heavy business logic here!
├── features/          # Domain-specific modules: auth, meals, groceries, recipes, profile
│   └── <feature>/
│       ├── api/       # TanStack Query hooks & API mutation calls
│       ├── components/# UI components used exclusively by this feature
│       ├── hooks/     # Local custom hooks & business logic
│       ├── screens/   # Full screen views (exported to app/ routes)
│       └── types/     # Feature-specific schemas & DTOs
└── shared/            # Cross-cutting primitives (theme, base components, storage, utils)
```

### The Feature Isolation Rule
- A feature may import from `src/shared/`.
- A feature **must NEVER** reach directly into another feature's internal folders (`features/meals` must NOT import from `features/groceries/components`).
- If a component or helper is needed across two or more features, elevate it to `src/shared/`.

---

## 3. Data, State & Storage

1. **Tokens & Credentials**: MUST be stored using `expo-secure-store`. Never store sensitive auth tokens in plain AsyncStorage or MMKV.
2. **Server State**: Use **TanStack Query**. Do NOT duplicate server responses in global state.
3. **Client State**: Use **Zustand** for lightweight local UI state (modal toggles, active filter selections).
4. **Offline Resilience**: Grocery checklists and weekly meal plans must be cached on-device for instant loading in supermarket aisles with poor connectivity.

---

## 4. Verification Before Finishing

Before marking any task as complete:
1. Run `npx tsc --noEmit` from `apps/mobile/` to verify **zero TypeScript errors**.
2. Ensure new components import theme tokens from `src/shared/theme/` rather than hardcoding arbitrary hex colors.
