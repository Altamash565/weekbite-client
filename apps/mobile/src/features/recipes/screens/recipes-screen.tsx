import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { RecipeCard } from '../components/recipe-card';
import { RecipeDetailModal } from '../components/recipe-detail-modal';
import { CreateRecipeModal } from '../components/create-recipe-modal';
import { LayoutModeToggle } from '../components/layout-mode-toggle';
import { useFavorites, useRecipes, useToggleFavorite } from '../hooks/useRecipes';
import { Recipe } from '../types/recipes.types';
import { colors } from '../../../shared/theme/tokens';

interface RecipesScreenProps {
  onNavigateToCreate?: () => void;
}

export const RecipesScreen: React.FC<RecipesScreenProps> = ({ onNavigateToCreate }) => {
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Queries & Mutations
  const {
    data: recipesData,
    isLoading,
    refetch,
    error,
  } = useRecipes({
    search: search.trim() || undefined,
    limit: 30,
  });

  const { data: favorites = [], refetch: refetchFavorites } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();

  const favoriteIds = useMemo(() => {
    return new Set(favorites.map((f) => f.recipeId));
  }, [favorites]);

  const recipes = recipesData?.recipes || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchFavorites()]);
    setRefreshing(false);
  };

  const handleToggleFavorite = (recipeId: string) => {
    const isFavorited = favoriteIds.has(recipeId);
    toggleFavoriteMutation.mutate({ recipeId, isFavorited });
  };

  // Chunk recipes into pairs of 2 for grid layout
  const recipePairs = useMemo(() => {
    const pairs: Recipe[][] = [];
    for (let i = 0; i < recipes.length; i += 2) {
      pairs.push(recipes.slice(i, i + 2));
    }
    return pairs;
  }, [recipes]);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View className="px-5 pt-3 pb-2">
        <Text className="font-bold text-2xl text-text-primary tracking-tight">
          Cookbook
        </Text>
      </View>

      {/* Search Input Bar */}
      <View className="px-5 mb-2.5">
        <View className="flex-row items-center bg-surface rounded-2xl border border-border px-3.5 h-[46px]">
          <Ionicons name="search-outline" size={17} color={colors.textSecondary} />
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

      {/* Below Search Bar: Recipe Count & Animated Layout Toggle */}
      <View className="px-5 mb-3 flex-row items-center justify-between">
        <Text className="font-semibold text-xs text-text-secondary tracking-wide uppercase">
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
        </Text>

        <LayoutModeToggle mode={layoutMode} onChange={setLayoutMode} />
      </View>

      {/* Main Feed */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 88 }}
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
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="small" color={colors.primaryDark} />
            <Text className="font-regular text-xs text-text-secondary mt-2">
              Loading your cookbook...
            </Text>
          </View>
        ) : error ? (
          <View className="py-14 items-center justify-center bg-surface rounded-2xl border border-border p-6 mt-2">
            <Ionicons name="alert-circle-outline" size={32} color={colors.error || '#D64545'} />
            <Text className="font-semibold text-sm text-text-primary mt-2">
              Failed to load recipes
            </Text>
            <Text className="font-regular text-xs text-text-secondary text-center mt-1 mb-4">
              {error.message}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="px-4 py-2 rounded-xl bg-primary-tint"
            >
              <Text className="font-semibold text-xs text-primary-dark">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : recipes.length === 0 ? (
          <View className="py-16 items-center justify-center bg-surface rounded-2xl border border-border p-6 mt-2 mx-1">
            <View className="w-16 h-16 rounded-3xl bg-primary-tint items-center justify-center mb-3">
              <Ionicons name="restaurant-outline" size={30} color={colors.primaryDark} />
            </View>
            <Text className="font-bold text-base text-text-primary text-center">
              Your cookbook is empty
            </Text>
            <Text className="font-regular text-xs text-text-secondary text-center mt-1 max-w-[240px] mb-5">
              {search
                ? `No recipes matched "${search}".`
                : 'Save and organize your favorite meals in one place.'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (onNavigateToCreate) {
                  onNavigateToCreate();
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
              className="px-5 py-2.5 rounded-2xl bg-primary flex-row items-center"
            >
              <Ionicons name="add" size={18} color={colors.onPrimary || '#0F2A0F'} />
              <Text className="font-bold text-xs text-on-primary ml-1">
                Add Recipe
              </Text>
            </TouchableOpacity>
          </View>
        ) : layoutMode === 'grid' ? (
          /* 2-Column Grid Layout */
          recipePairs.map((pair, rowIndex) => (
            <View key={rowIndex} className="flex-row">
              {pair.map((item) => (
                <RecipeCard
                  key={item.id}
                  recipe={item}
                  layout="grid"
                  isFavorited={favoriteIds.has(item.id)}
                  onPress={() => setSelectedRecipeId(item.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
              {/* Spacer if odd number in row */}
              {pair.length === 1 && <View className="flex-1 mx-1.5" />}
            </View>
          ))
        ) : (
          /* List Layout */
          recipes.map((item) => (
            <RecipeCard
              key={item.id}
              recipe={item}
              layout="list"
              isFavorited={favoriteIds.has(item.id)}
              onPress={() => setSelectedRecipeId(item.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button (+) — Sharp Square Shape */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (onNavigateToCreate) {
            onNavigateToCreate();
          } else {
            setIsCreateModalOpen(true);
          }
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="absolute right-5 bottom-4 w-14 h-14 rounded-[8px] bg-primary items-center justify-center shadow-lg active:scale-95"
        style={{
          elevation: 6,
          shadowColor: '#1F8A1F',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
        }}
      >
        <Ionicons name="add" size={30} color={colors.onPrimary || '#0F2A0F'} />
      </TouchableOpacity>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipeId={selectedRecipeId}
        isFavorited={selectedRecipeId ? favoriteIds.has(selectedRecipeId) : false}
        onClose={() => setSelectedRecipeId(null)}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Create Recipe Modal */}
      <CreateRecipeModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </View>
  );
};
