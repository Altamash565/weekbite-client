import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
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
import { ChefIllustration } from '../components/chef-illustration';
import { useFavorites, useRecipes, useToggleFavorite } from '../hooks/useRecipes';
import { Recipe } from '../types/recipes.types';
import { useCurrentUser } from '../../auth';
import { colors, fonts } from '../../../shared/theme/tokens';
import { useKeyboardVisible } from '../../../shared/hooks/useKeyboardVisible';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
// Calculate optical vertical center once so it is 100% static with zero glitchiness on tab change
const EMPTY_STATE_TOP_OFFSET = Math.max(32, Math.round((WINDOW_HEIGHT - 220 - 240) / 2 - 20));

interface RecipesScreenProps {
  onNavigateToCreate?: () => void;
}

export const RecipesScreen: React.FC<RecipesScreenProps> = ({ onNavigateToCreate }) => {
  const insets = useSafeAreaInsets();
  const isKeyboardVisible = useKeyboardVisible();
  const searchInputRef = React.useRef<React.ComponentRef<typeof TextInput>>(null);

  const [search, setSearch] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // User Authentication Context
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const currentUserId = user?.id || user?._id;

  // Queries & Mutations
  const {
    data: recipesData,
    isLoading,
    refetch,
    error,
  } = useRecipes({
    search: search.trim() || undefined,
    limit: 50,
  });

  const { data: favorites = [], refetch: refetchFavorites } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();

  const favoriteIds = useMemo(() => {
    return new Set(favorites.map((f) => f.recipeId));
  }, [favorites]);

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
            ref={searchInputRef}
            value={search}
            onChangeText={setSearch}
            placeholder="Search recipes, ingredients..."
            placeholderTextColor={colors.textSecondary}
            className="flex-1 ml-2 text-sm font-regular text-text-primary h-full"
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
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
      {recipes.length > 0 && (
        <View className="px-5 mb-3 flex-row items-center justify-between">
          <Text className="font-semibold text-xs text-text-secondary tracking-wide uppercase">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          </Text>

          <LayoutModeToggle mode={layoutMode} onChange={setLayoutMode} />
        </View>
      )}

      {/* Main Feed */}
      {(isLoading || (isUserLoading && !user)) && !refreshing ? (
        <View className="flex-1 items-center justify-center pb-16">
          <ActivityIndicator size="large" color={colors.primaryDark} />
          <Text
            style={{ fontFamily: fonts.medium }}
            className="text-xs text-text-secondary mt-3"
          >
            Loading your cookbook...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingBottom: 88,
          }}
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
          <View
            style={{
              paddingTop: EMPTY_STATE_TOP_OFFSET,
            }}
            className="items-center justify-center px-6 pb-6"
          >
            <ChefIllustration size={180} />
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
      )}

      {/* Floating Action Button (+) — Sharp Square Shape */}
      {!isKeyboardVisible && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (onNavigateToCreate) {
              onNavigateToCreate();
            } else {
              setIsCreateModalOpen(true);
            }
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="absolute right-5 bottom-4 w-14 h-14 rounded-[8px] bg-primary items-center justify-center"
        >
          <Ionicons name="add" size={30} color={colors.onPrimary || '#0F2A0F'} />
        </TouchableOpacity>
      )}

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
