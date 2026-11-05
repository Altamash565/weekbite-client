import { z } from 'zod';

export type RecipeCategory =
  | 'BREAKFAST'
  | 'LUNCH'
  | 'DINNER'
  | 'SNACK'
  | 'DESSERT'
  | 'OTHER';

export const recipeCategorySchema = z.enum([
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK',
  'DESSERT',
  'OTHER',
]);

export const ingredientSchema = z.object({
  name: z.string().trim().min(1, 'Ingredient name is required'),
  quantity: z.string().trim().min(1, 'Ingredient quantity is required'),
});

export const createRecipeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  image: z.string().trim().optional(),
  prepTime: z
    .number()
    .int('Prep time must be a whole number')
    .min(0, 'Prep time cannot be negative'),
  cookTime: z
    .number()
    .int('Cook time must be a whole number')
    .min(0, 'Cook time cannot be negative'),
  servings: z
    .number()
    .int('Servings must be a whole number')
    .min(1, 'Servings must be at least 1')
    .max(1000, 'Servings cannot exceed 1,000'),
  instructions: z
    .string()
    .trim()
    .min(10, 'Instructions must be at least 10 characters long'),
  category: recipeCategorySchema,
  ingredients: z
    .array(ingredientSchema)
    .min(1, 'At least one ingredient is required'),
});

export type CreateRecipeSchemaInput = z.infer<typeof createRecipeSchema>;

export type RecipeSortBy = 'createdAt' | 'title' | 'prepTime' | 'cookTime';
export type SortOrder = 'asc' | 'desc';

export interface Ingredient {
  id?: string;
  name: string;
  quantity: string;
}

export interface RecipeUserSummary {
  id: string;
  name: string;
  email: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  prepTime: number;
  cookTime: number;
  servings: number;
  instructions: string;
  category: RecipeCategory;
  ingredients?: Ingredient[];
  createdById: string;
  createdBy?: RecipeUserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeDto {
  title: string;
  description?: string;
  image?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  instructions: string;
  category: RecipeCategory;
  ingredients: Array<{
    name: string;
    quantity: string;
  }>;
}

export interface UpdateRecipeDto {
  title?: string;
  description?: string;
  image?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  instructions?: string;
  category?: RecipeCategory;
  ingredients?: Array<{
    name: string;
    quantity: string;
  }>;
}

export interface GetRecipesQuery {
  search?: string;
  category?: RecipeCategory;
  page?: number;
  limit?: number;
  sortBy?: RecipeSortBy;
  sortOrder?: SortOrder;
}

export interface RecipesResponse {
  recipes: Recipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FavoriteItem {
  id: string;
  userId: string;
  recipeId: string;
  recipe: Recipe;
  createdAt: string;
}

export interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
