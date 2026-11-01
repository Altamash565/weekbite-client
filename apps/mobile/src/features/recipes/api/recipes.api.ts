import { apiClient } from '../../../shared/api/api-client';
import {
  BackendResponse,
  CreateRecipeDto,
  FavoriteItem,
  GetRecipesQuery,
  Recipe,
  RecipesResponse,
  UpdateRecipeDto,
} from '../types/recipes.types';

export const recipesApi = {
    getRecipes: async (query?: GetRecipesQuery): Promise<RecipesResponse> => {
      const params = new URLSearchParams();
      if (query?.search) params.append('search', query.search);
      if (query?.category) params.append('category', query.category);
      if (query?.page) params.append('page', String(query.page));
      if (query?.limit) params.append('limit', String(query.limit || 20));
      if (query?.sortBy) params.append('sortBy', query.sortBy);
      if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

      const qs = params.toString();
      const endpoint = `/recipes${qs ? `?${qs}` : ''}`;
      const response = await apiClient.get<BackendResponse<RecipesResponse>>(endpoint);
      return response.data;
    },

      getMyRecipes: async (): Promise<Recipe[]> => {
        const response = await apiClient.get<BackendResponse<Recipe[]>>('/recipes/my');
        return response.data || [];
      },

        getRecipeById: async (id: string): Promise<Recipe> => {
          const response = await apiClient.get<BackendResponse<Recipe>>(`/recipes/${id}`);
          return response.data;
        },

          createRecipe: async (data: CreateRecipeDto): Promise<Recipe> => {
            const response = await apiClient.post<BackendResponse<Recipe>>('/recipes', data);
            return response.data;
          },

            updateRecipe: async (id: string, data: UpdateRecipeDto): Promise<Recipe> => {
              const response = await apiClient.patch<BackendResponse<Recipe>>(`/recipes/${id}`, data);
              return response.data;
            },

              deleteRecipe: async (id: string): Promise<void> => {
                await apiClient.delete(`/recipes/${id}`);
              },

                getMyFavorites: async (): Promise<FavoriteItem[]> => {
                  const response = await apiClient.get<BackendResponse<FavoriteItem[]>>('/favorites');
                  return response.data || [];
                },

                  addFavorite: async (recipeId: string): Promise<FavoriteItem> => {
                    const response = await apiClient.post<BackendResponse<FavoriteItem>>(`/favorites/${recipeId}`);
                    return response.data;
                  },

                    removeFavorite: async (recipeId: string): Promise<void> => {
                      await apiClient.delete(`/favorites/${recipeId}`);
                    },
};
