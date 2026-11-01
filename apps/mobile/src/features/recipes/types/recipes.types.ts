export type RecipeCategory =
  | 'BREAKFAST'
  | 'LUNCH'
  | 'DINNER'
  | 'SNACK'
  | 'DESSERT'
  | 'OTHER';

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
