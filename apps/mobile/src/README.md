# Mobile App Architecture (`apps/mobile/src`)

This folder follows a **Feature-Driven Architecture** paired with **Expo Router** route groups.

## Folder Structure

```text
apps/mobile/
├── assets/                     # App icons, splash screens, local SVGs/images
│
├── src/
│   ├── app/                    # Routing & Navigation (Expo Router)
│   │   ├── (auth)/             # Auth stack (Sign In, Sign Up, Forgot Password)
│   │   ├── (tabs)/             # Main bottom tabs (Compass, Meals, Groceries, Profile)
│   │   ├── _layout.tsx         # Root layout, providers, splash screen handling
│   │   └── navigation/         # Navigators, tab bars, route params & typed hooks
│   │
│   ├── features/               # ⭐️ CORE BUSINESS DOMAINS
│   │   ├── auth/               # Authentication & onboarding
│   │   │   ├── api/            # Login, register, logout API queries & mutations
│   │   │   ├── components/     # Auth-specific UI (SocialLoginButtons, PasswordMeter)
│   │   │   ├── hooks/          # useAuth, useSession
│   │   │   ├── screens/        # AuthScreen, ForgotPasswordScreen
│   │   │   └── types/          # Auth schemas, JWT payloads
│   │   │
│   │   ├── meals/              # Weekly meal planner / Compass
│   │   │   ├── api/            # fetchWeeklyPlan, assignMealMutation
│   │   │   ├── components/     # DayCard, MealSlot, CalorieIndicator, StreakBadge
│   │   │   ├── hooks/          # useWeeklyPlan, useMealDragAndDrop
│   │   │   ├── screens/        # CompassScreen, DayDetailScreen
│   │   │   └── types/          # MealPlan, MealSlotType
│   │   │
│   │   ├── groceries/          # Shopping checklist & pantry sync
│   │   │   ├── api/            # fetchGroceries, toggleItemMutation
│   │   │   ├── components/     # GroceryItemRow, CategoryHeader, QuickAddBar
│   │   │   ├── hooks/          # useGroceryList, useAisleGrouping
│   │   │   └── screens/        # GroceryListScreen
│   │   │   └── types/          # GroceryItem, AisleCategory
│   │   │
│   │   ├── recipes/            # Recipe discovery, prep times, instructions
│   │   │   ├── api/            # searchRecipes, fetchRecipeDetail
│   │   │   ├── components/     # RecipeCard, PrepTimer, IngredientList
│   │   │   ├── hooks/          # Recipe search & favorite hooks
│   │   │   ├── screens/        # RecipeFeedScreen, RecipeDetailScreen
│   │   │   └── types/          # Recipe, Ingredient
│   │   │
│   │   └── profile/            # Dietary goals, kitchen settings, theme
│   │       ├── components/     # DietaryTagSelector, AllergySettings
│   │       └── screens/        # ProfileScreen, PreferencesScreen
│   │
│   ├── shared/                 # ⭐️ CROSS-CUTTING REUSABLES
│   │   ├── components/         # Design system primitives (Button, Input, Card, Modal, Badge)
│   │   ├── theme/              # Colors, typography, spacing, shadows, borderRadii
│   │   ├── services/           # Network client (Axios/Ky), API interceptors, Sentry
│   │   ├── storage/            # MMKV storage keys, secure store helpers
│   │   ├── hooks/              # useOnlineStatus, useDebounce, useKeyboard
│   │   └── utils/              # Date/week helpers, currency, formatters
│   │
│   └── types/                  # Global app types & environment declarations
│
├── app.json                    # Expo configuration
├── package.json
└── tsconfig.json
```

## Core Architectural Rules

1. **Feature Isolation**: A feature can import from `shared/`, but must not reach directly into another feature's internal folders.
2. **Thin Route Files**: Route files in `app/` should be minimal; they import and render screens from `features/*/screens/`.
3. **Colocation**: Keep hooks, types, and components as close to where they are used as possible.
