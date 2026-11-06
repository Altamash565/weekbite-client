import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites, useRecipes, useToggleFavorite } from '../hooks/useRecipes';
import { Recipe, RecipeCategory } from '../types/recipes.types';
import { RecipeDetailModal } from '../components/recipe-detail-modal';
import { ChefIllustration } from '../components/chef-illustration';
import { useCurrentUser } from '../../auth';
import { colors, fonts } from '../../../shared/theme/tokens';

const CATEGORIES: Array<{ key: string; label: string; value?: RecipeCategory }> = [
  { key: 'ALL', label: 'All' },
  { key: 'BREAKFAST', label: 'Breakfast', value: 'BREAKFAST' },
  { key: 'LUNCH', label: 'Lunch', value: 'LUNCH' },
  { key: 'DINNER', label: 'Dinner', value: 'DINNER' },
  { key: 'SNACK', label: 'Snacks', value: 'SNACK' },
  { key: 'DESSERT', label: 'Desserts', value: 'DESSERT' },
];

export const HomeDiscoverScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());

  const activeCategoryValue = useMemo(() => {
    const found = CATEGORIES.find((c) => c.key === selectedCategory);
    return found?.value;
  }, [selectedCategory]);

  const {
    data: recipesData,
    isLoading,
    refetch,
    error,
  } = useRecipes({
    search: search.trim() || undefined,
    category: activeCategoryValue,
    limit: 50,
  });

  const { data: favorites = [], refetch: refetchFavorites } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();

  const favoriteIds = useMemo(() => {
    return new Set(favorites.map((f) => f.recipeId));
  }, [favorites]);

  const currentUserId = user?.id || user?._id;

  // Only display recipes created by the current authenticated user
  const recipes = useMemo(() => {
    const all = recipesData?.recipes || [];
    if (!currentUserId) return [];
    return all.filter(
      (recipe) =>
        recipe.createdById === currentUserId ||
        recipe.createdBy?.id === currentUserId ||
        Boolean(
          user?.email &&
          recipe.createdBy?.email &&
          recipe.createdBy.email.toLowerCase() === user.email.toLowerCase()
        )
    );
  }, [recipesData?.recipes, currentUserId, user?.email]);

  const featuredRecipe = recipes.length > 0 ? recipes[0] : null;
  const otherRecipes = recipes.length > 1 ? recipes.slice(1) : [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchFavorites()]);
    setRefreshing(false);
  };

  const handleToggleFavorite = (recipeId: string) => {
    const isFavorited = favoriteIds.has(recipeId);
    toggleFavoriteMutation.mutate({ recipeId, isFavorited });
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'there';
  const initial = (user?.name || user?.email || 'W').charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-3 pb-3 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="font-bold text-2xl text-text-primary tracking-tight">
            Hi, {displayName} 👋
          </Text>
          <Text className="font-regular text-xs text-text-secondary mt-0.5">
            What would you like to cook today?
          </Text>
        </View>

        <View className="w-11 h-11 rounded-full bg-primary-tint border border-primary-dark/20 items-center justify-center">
          <Text className="font-bold text-base text-primary-dark">{initial}</Text>
        </View>
      </View>

      {/* Search Input */}
      <View className="px-5 mb-3">
        <View className="flex-row items-center bg-surface rounded-xl border border-border px-3.5 h-[48px]">
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search recipes, ingredients..."
            placeholderTextColor={colors.textSecondary}
            className="flex-1 ml-2 text-sm font-regular text-text-primary h-full"
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {Boolean(search) && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Chips */}
      <View className="mb-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(cat.key)}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                className={`px-4 py-2 rounded-full border ${
                  isSelected
                    ? 'bg-primary border-primary'
                    : 'bg-surface border-border'
                }`}
              >
                <Text
                  className={`text-xs ${
                    isSelected
                      ? 'font-semibold text-on-primary'
                      : 'font-medium text-text-secondary'
                  }`}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Feed */}
      {(isLoading || (isUserLoading && !user)) && !refreshing ? (
        <View className="flex-1 items-center justify-center pb-16">
          <ActivityIndicator size="large" color={colors.primaryDark} />
          <Text
            style={{ fontFamily: fonts.medium }}
            className="text-xs text-text-secondary mt-3"
          >
            Discovering your recipes...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primaryDark}
            />
          }
        >
          {error ? (
          <View className="py-12 items-center justify-center bg-surface rounded-2xl border border-border p-6 mt-2">
            <Ionicons name="alert-circle-outline" size={32} color={colors.error || '#D64545'} />
            <Text className="font-semibold text-sm text-text-primary mt-2">
              Unable to load recipes
            </Text>
            <Text className="font-regular text-xs text-text-secondary text-center mt-1 mb-4">
              {error.message}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="px-4 py-2 rounded-xl bg-primary-tint"
            >
              <Text className="font-semibold text-xs text-primary-dark">Try again</Text>
            </TouchableOpacity>
          </View>
        ) : recipes.length === 0 ? (
          <View className="py-16 items-center justify-center px-6">
            <ChefIllustration size={160} />
            {search ? (
              <Text
                style={{ fontFamily: fonts.medium }}
                className="text-sm text-text-secondary text-center mt-5"
              >
                No recipes matched "{search}"
              </Text>
            ) : (
              <>
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-base text-text-primary text-center mt-5"
                >
                  No recipes yet
                </Text>
                <Text
                  style={{ fontFamily: fonts.regular }}
                  className="text-xs text-text-secondary text-center mt-1"
                >
                  Add your first recipe to get started
                </Text>
              </>
            )}
          </View>
        ) : (
          <>
            {/* Featured Hero Card (if no active search query) */}
            {featuredRecipe && !search && (
              <View className="mb-5">
                <Text className="font-semibold text-xs text-text-secondary uppercase tracking-wider mb-2">
                  Today's Highlight
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setSelectedRecipeId(featuredRecipe.id)}
                  className="bg-surface rounded-2xl border border-border overflow-hidden"
                >
                  {featuredRecipe.image && !failedImageIds.has(featuredRecipe.id) ? (
                    <Image
                      source={{ uri: featuredRecipe.image }}
                      className="w-full h-44 bg-surface-low"
                      resizeMode="cover"
                      onError={() => {
                        setFailedImageIds((prev) => new Set(prev).add(featuredRecipe.id));
                      }}
                    />
                  ) : (
                    <View className="w-full h-36 bg-primary-tint/60 items-center justify-center">
                      <Ionicons name="restaurant" size={36} color={colors.primaryDark} />
                    </View>
                  )}

                  <View className="p-4">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <View className="bg-primary-tint px-2.5 py-0.5 rounded-full">
                        <Text className="font-semibold text-[10px] text-primary-dark uppercase">
                          {featuredRecipe.category}
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleToggleFavorite(featuredRecipe.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        className="w-8 h-8 rounded-full bg-background border border-border items-center justify-center"
                      >
                        <Ionicons
                          name={favoriteIds.has(featuredRecipe.id) ? 'heart' : 'heart-outline'}
                          size={18}
                          color={
                            favoriteIds.has(featuredRecipe.id)
                              ? colors.error || '#D64545'
                              : colors.textSecondary
                          }
                        />
                      </TouchableOpacity>
                    </View>

                    <Text className="font-bold text-lg text-text-primary mb-1" numberOfLines={1}>
                      {featuredRecipe.title}
                    </Text>

                    {Boolean(featuredRecipe.description) && (
                      <Text
                        className="font-regular text-xs text-text-secondary leading-4 mb-3"
                        numberOfLines={2}
                      >
                        {featuredRecipe.description}
                      </Text>
                    )}

                    <View className="flex-row items-center gap-3 pt-1 border-t border-border/60">
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                        <Text className="font-medium text-xs text-text-secondary ml-1">
                          {featuredRecipe.prepTime + featuredRecipe.cookTime} mins
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="people-outline" size={13} color={colors.textSecondary} />
                        <Text className="font-medium text-xs text-text-secondary ml-1">
                          {featuredRecipe.servings} servings
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Discover / All Recipes Section */}
            <View>
              <Text className="font-semibold text-xs text-text-secondary uppercase tracking-wider mb-2">
                {search ? 'Search Results' : 'My Recipes'}
              </Text>

              {(search ? recipes : otherRecipes).map((recipe: Recipe) => {
                const isFav = favoriteIds.has(recipe.id);
                return (
                  <TouchableOpacity
                    key={recipe.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedRecipeId(recipe.id)}
                    className="bg-surface rounded-xl border border-border p-3.5 mb-3 flex-row items-center justify-between"
                  >
                    {recipe.image && !failedImageIds.has(recipe.id) ? (
                      <View className="w-16 h-16 rounded-[12px] overflow-hidden bg-surface-low mr-3 border border-border/60">
                        <Image
                          source={{ uri: recipe.image }}
                          className="w-full h-full"
                          resizeMode="cover"
                          onError={() => {
                            setFailedImageIds((prev) => new Set(prev).add(recipe.id));
                          }}
                        />
                      </View>
                    ) : null}

                    <View className="flex-1 pr-3">
                      <View className="flex-row items-center mb-1">
                        <View className="bg-primary-tint px-2 py-0.5 rounded mr-2">
                          <Text className="font-semibold text-[9px] text-primary-dark uppercase">
                            {recipe.category}
                          </Text>
                        </View>
                        <Text className="font-medium text-xs text-text-secondary">
                          {recipe.prepTime + recipe.cookTime} mins
                        </Text>
                      </View>

                      <Text
                        className="font-bold text-base text-text-primary mb-1"
                        numberOfLines={1}
                      >
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
                      onPress={() => handleToggleFavorite(recipe.id)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      className="w-9 h-9 rounded-full bg-background border border-border items-center justify-center ml-2"
                    >
                      <Ionicons
                        name={isFav ? 'heart' : 'heart-outline'}
                        size={17}
                        color={isFav ? colors.error || '#D64545' : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
      )}

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipeId={selectedRecipeId}
        isFavorited={selectedRecipeId ? favoriteIds.has(selectedRecipeId) : false}
        onClose={() => setSelectedRecipeId(null)}
        onToggleFavorite={handleToggleFavorite}
      />
    </View>
  );
};

