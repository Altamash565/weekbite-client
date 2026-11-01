import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RecipeDetailModal } from '../components/recipe-detail-modal';
import { useFavorites, useToggleFavorite } from '../hooks/useRecipes';
import { colors } from '../../../shared/theme/tokens';

export const FavouritesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const { data: favorites = [], isLoading, refetch, error } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleToggleFavorite = (recipeId: string) => {
    toggleFavoriteMutation.mutate({ recipeId, isFavorited: true });
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-3 pb-3 flex-row items-center justify-between">
        <View>
          <Text className="font-bold text-2xl text-text-primary tracking-tight">
            Favourites
          </Text>
          <Text className="font-regular text-xs text-text-secondary mt-0.5">
            {favorites.length} saved recipes
          </Text>
        </View>

        <View className="w-10 h-10 rounded-2xl bg-primary-tint items-center justify-center">
          <Ionicons name="heart" size={20} color={colors.primaryDark} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-5 pt-2"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primaryDark}
          />
        }
      >
        {isLoading && !refreshing ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="small" color={colors.primaryDark} />
            <Text className="font-regular text-xs text-text-secondary mt-2">
              Loading your favourites...
            </Text>
          </View>
        ) : error ? (
          <View className="py-12 items-center justify-center bg-surface rounded-2xl border border-border p-6 mt-2">
            <Ionicons name="alert-circle-outline" size={32} color={colors.error || '#D64545'} />
            <Text className="font-semibold text-sm text-text-primary mt-2">
              Failed to load favourites
            </Text>
            <Text className="font-regular text-xs text-text-secondary text-center mt-1">
              {error.message}
            </Text>
          </View>
        ) : favorites.length === 0 ? (
          <View className="py-16 items-center justify-center bg-surface rounded-2xl border border-border p-6 mt-2">
            <View className="w-14 h-14 rounded-2xl bg-primary-tint items-center justify-center mb-3">
              <Ionicons name="heart-outline" size={28} color={colors.primaryDark} />
            </View>
            <Text className="font-bold text-base text-text-primary text-center">
              No favourites saved yet
            </Text>
            <Text className="font-regular text-xs text-text-secondary text-center mt-1 max-w-[240px]">
              Tap the heart icon on any recipe in the Recipes tab to keep it handy here.
            </Text>
          </View>
        ) : (
          favorites.map((fav) => {
            const recipe = fav.recipe;
            return (
              <TouchableOpacity
                key={fav.id}
                activeOpacity={0.8}
                onPress={() => setSelectedRecipeId(fav.recipeId)}
                className="bg-surface rounded-xl border border-border p-4 mb-3 flex-row items-center justify-between"
              >
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center mb-1">
                    {Boolean(recipe.category) && (
                      <View className="bg-primary-tint px-2 py-0.5 rounded mr-2">
                        <Text className="font-semibold text-[9px] text-primary-dark uppercase">
                          {recipe.category}
                        </Text>
                      </View>
                    )}
                    <Text className="font-medium text-xs text-text-secondary">
                      {recipe.prepTime + recipe.cookTime} mins • {recipe.servings} serv
                    </Text>
                  </View>

                  <Text className="font-bold text-base text-text-primary mb-1" numberOfLines={1}>
                    {recipe.title}
                  </Text>

                  {Boolean(recipe.description) && (
                    <Text
                      className="font-regular text-xs text-text-secondary leading-4"
                      numberOfLines={1}
                    >
                      {recipe.description}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleToggleFavorite(fav.recipeId)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  className="w-9 h-9 rounded-full bg-background border border-border items-center justify-center"
                >
                  <Ionicons name="heart" size={18} color={colors.error || '#D64545'} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipeId={selectedRecipeId}
        isFavorited={true}
        onClose={() => setSelectedRecipeId(null)}
        onToggleFavorite={handleToggleFavorite}
      />
    </View>
  );
};
