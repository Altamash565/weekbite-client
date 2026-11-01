import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recipesApi } from '../api/recipes.api';
import {
  CreateRecipeDto,
  FavoriteItem,
  GetRecipesQuery,
  Recipe,
  RecipesResponse,
  UpdateRecipeDto,
} from '../types/recipes.types';

export const RECIPES_QUERY_KEY = 'recipes';
export const FAVORITES_QUERY_KEY = 'favorites';

export function useRecipes(query?: GetRecipesQuery) {
  return useQuery<RecipesResponse, Error>({
    queryKey: [RECIPES_QUERY_KEY, query],
    queryFn: () => recipesApi.getRecipes(query),
    staleTime: 1000 * 60 * 3,
  });
}

export function useMyRecipes() {
  return useQuery<Recipe[], Error>({
    queryKey: [RECIPES_QUERY_KEY, 'my'],
    queryFn: () => recipesApi.getMyRecipes(),
    staleTime: 1000 * 60 * 3,
  });
}

export function useRecipeDetail(id: string | null) {
  return useQuery<Recipe, Error>({
    queryKey: [RECIPES_QUERY_KEY, 'detail', id],
    queryFn: () => recipesApi.getRecipeById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation<Recipe, Error, CreateRecipeDto>({
    mutationFn: (dto) => recipesApi.createRecipe(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECIPES_QUERY_KEY] });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation<Recipe, Error, { id: string; data: UpdateRecipeDto }>({
    mutationFn: ({ id, data }) => recipesApi.updateRecipe(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [RECIPES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [RECIPES_QUERY_KEY, 'detail', variables.id],
      });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => recipesApi.deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECIPES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
    },
  });
}

export function useFavorites() {
  return useQuery<FavoriteItem[], Error>({
    queryKey: [FAVORITES_QUERY_KEY],
    queryFn: () => recipesApi.getMyFavorites(),
    staleTime: 1000 * 60 * 3,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { recipeId: string; isFavorited: boolean }>({
    mutationFn: async ({ recipeId, isFavorited }) => {
      if (isFavorited) {
        await recipesApi.removeFavorite(recipeId);
      } else {
        await recipesApi.addFavorite(recipeId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
    },
  });
}
