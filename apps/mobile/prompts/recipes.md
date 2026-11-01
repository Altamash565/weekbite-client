# Recipes Feature Specification (`features/recipes`)

> **Calm Culinary Minimal** — Production-grade Recipe discovery, catalog, detail, and management for WeekBite mobile client, strictly aligned with `WeekBite_Postman_Collection.json` and backend schemas.

---

## 1. Backend Endpoint Contract (Truth from Postman & Backend Code)

The backend exposes the following endpoints under `baseUrl = http://localhost:5000/api/v1`:

### A. Recipe Endpoints (`/recipes`)
| Method | Endpoint | Auth Required | Description & Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/recipes` | No | List recipes with query params: `search`, `category`, `page`, `limit`, `sortBy` (`createdAt` \| `title` \| `prepTime` \| `cookTime`), `sortOrder` (`asc` \| `desc`). |
| `GET` | `/recipes/my` | Yes | List recipes created by the authenticated user. |
| `GET` | `/recipes/:id` | Yes | Get complete recipe details including `ingredients` and `createdBy` (`id`, `name`, `email`). |
| `POST` | `/recipes` | Yes | Create new recipe. Body: `title`, `description?`, `image?`, `prepTime`, `cookTime`, `servings`, `instructions`, `category`, `ingredients` (`[{ name, quantity }]`). |
| `PATCH` | `/recipes/:id` | Yes | Update recipe fields (only allowed if created by current user). |
| `DELETE` | `/recipes/:id` | Yes | Delete recipe (only allowed if created by current user). |

### B. Favorite Endpoints (`/favorites`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/favorites` | Yes | List all favorite recipes for the authenticated user. |
| `POST` | `/favorites/:recipeId` | Yes | Add recipe to authenticated user's favorites. |
| `DELETE` | `/favorites/:recipeId` | Yes | Remove recipe from authenticated user's favorites. |

### C. Strict Backend Data Model (Prisma `Recipe` & `Ingredient`)
```typescript
enum RecipeCategory {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
  DESSERT = 'DESSERT',
  OTHER = 'OTHER'
}

interface Ingredient {
  id?: string;
  name: string;
  quantity: string;
}

interface Recipe {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  instructions: string;
  category: RecipeCategory;
  ingredients?: Ingredient[];
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

> **Strict Rule:** Only display and collect fields that exist in the backend schema:
> - **ALLOWED:** `title`, `description`, `image`, `prepTime`, `cookTime`, `servings`, `instructions`, `category`, `ingredients` (`name`, `quantity`), `createdBy`, `createdAt`.
> - **FORBIDDEN (No Backend Support):** Calories, macros, difficulty levels (easy/medium/hard), user review ratings/stars, comments.

---

## 2. Component & Architecture Structure

```text
apps/mobile/src/features/recipes/
├── api/
│   └── recipes.api.ts          # Strongly-typed fetch client for recipes & favorites
├── types/
│   └── recipes.types.ts        # Recipe, Ingredient, DTOs, Zod schemas
├── hooks/
│   └── useRecipes.ts           # TanStack Query queries & optimistic mutations
├── components/
│   ├── recipe-card.tsx         # Calm minimal recipe card with time, servings, category, heart
│   ├── category-chips.tsx      # Horizontal category pill selector
│   ├── sort-selector.tsx       # Calm dropdown/picker for sortBy & sortOrder
│   ├── recipe-detail-modal.tsx # Full screen sheet: hero image, ingredients, instructions
│   └── create-recipe-modal.tsx # Minimal form to create a new recipe (title, times, ingredients, etc.)
├── screens/
│   ├── recipes-screen.tsx      # Primary Recipes Tab: Search, filter, sorting, recipe list, create CTA
│   └── favourites-screen.tsx   # Favourites Tab: Saved recipes feed with instant removal
└── index.ts                    # Public barrel exports
```

---

## 3. Visual & UX Constraints (from `DESIGN.md`)

1. **Colors**:
   - Canvas: `bg-background` (`#F8FAF7`)
   - Cards/Surfaces: `bg-surface` (`#FFFFFF`), border `border-border` (`#E6EAE4`)
   - Accent / Active: `bg-primary` (`#32CD32`) with `text-on-primary` (`#0F2A0F`)
   - Heart active: `#D64545` (`colors.error`)
2. **Ergonomics**:
   - Minimum 48x48pt touch targets on all interactive controls (`hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}`).
   - Safe area handling on modals and scroll views.

