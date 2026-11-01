import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDeleteRecipe, useRecipeDetail } from '../hooks/useRecipes';
import { colors } from '../../../shared/theme/tokens';
import { useCurrentUser } from '../../auth';

interface RecipeDetailModalProps {
  recipeId: string | null;
  isFavorited?: boolean;
  onClose: () => void;
  onToggleFavorite: (recipeId: string) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipeId,
  isFavorited = false,
  onClose,
  onToggleFavorite,
}) => {
  const insets = useSafeAreaInsets();
  const { data: user } = useCurrentUser();
  const { data: recipe, isLoading, error } = useRecipeDetail(recipeId);
  const deleteMutation = useDeleteRecipe();

  // Checked ingredients for cooking session
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const toggleIngredient = (idOrIndex: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idOrIndex]: !prev[idOrIndex],
    }));
  };

  const isOwner = Boolean(user && recipe && user.id === recipe.createdById);

  const handleDelete = () => {
    if (!recipeId) return;

    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to permanently delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(recipeId, {
              onSuccess: () => {
                onClose();
              },
              onError: (err) => {
                Alert.alert('Delete Failed', err.message || 'Could not delete recipe');
              },
            });
          },
        },
      ]
    );
  };

  // Format multi-step instructions
  const steps = React.useMemo(() => {
    if (!recipe?.instructions) return [];
    return recipe.instructions
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => Boolean(s));
  }, [recipe?.instructions]);

  return (
    <Modal
      visible={Boolean(recipeId)}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {/* Top Floating Controls */}
        <View
          className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-5 pt-3 pb-2"
          style={{ paddingTop: Math.max(insets.top, 16) }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
          >
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            {isOwner && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDelete}
                disabled={deleteMutation.isPending}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={colors.error || '#D64545'}
                />
              </TouchableOpacity>
            )}

            {recipeId && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onToggleFavorite(recipeId)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
              >
                <Ionicons
                  name={isFavorited ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorited ? colors.error || '#D64545' : colors.textPrimary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Loading / Error / Content */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color={colors.primaryDark} />
            <Text className="font-regular text-xs text-text-secondary mt-2">
              Loading recipe...
            </Text>
          </View>
        ) : error || !recipe ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="alert-circle-outline" size={36} color={colors.error || '#D64545'} />
            <Text className="font-bold text-base text-text-primary mt-3 text-center">
              Unable to load recipe
            </Text>
            <Text className="font-regular text-xs text-text-secondary mt-1 text-center">
              {error?.message || 'Recipe not found'}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 40) }}
            showsVerticalScrollIndicator={false}
          >
            {/* Full-bleed Hero Visual */}
            <View className="relative w-full h-72 bg-surface-low">
              {recipe.image ? (
                <Image
                  source={{ uri: recipe.image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-primary-tint/60 items-center justify-center">
                  <Ionicons name="restaurant-outline" size={54} color={colors.primaryDark} />
                </View>
              )}
            </View>

            {/* Recipe Info Body */}
            <View className="px-5 pt-5">
              {/* Category & Author Badge */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="bg-primary-tint px-3 py-1 rounded-full">
                  <Text className="font-bold text-[11px] text-primary-dark uppercase tracking-wider">
                    {recipe.category}
                  </Text>
                </View>

                {recipe.createdBy && (
                  <Text className="font-medium text-xs text-text-secondary">
                    By {recipe.createdBy.name}
                  </Text>
                )}
              </View>

              {/* Title */}
              <Text className="font-bold text-2xl text-text-primary tracking-tight mb-2">
                {recipe.title}
              </Text>

              {/* Description */}
              {Boolean(recipe.description) && (
                <Text className="font-regular text-sm text-text-secondary leading-5 mb-5">
                  {recipe.description}
                </Text>
              )}

              {/* Stats Bar */}
              <View className="bg-surface rounded-2xl border border-border p-4 mb-6 flex-row justify-around">
                <View className="items-center">
                  <Text className="font-regular text-[11px] text-text-secondary mb-0.5">
                    Prep Time
                  </Text>
                  <Text className="font-bold text-sm text-text-primary">
                    {recipe.prepTime} min
                  </Text>
                </View>

                <View className="w-[1px] bg-border" />

                <View className="items-center">
                  <Text className="font-regular text-[11px] text-text-secondary mb-0.5">
                    Cook Time
                  </Text>
                  <Text className="font-bold text-sm text-text-primary">
                    {recipe.cookTime} min
                  </Text>
                </View>

                <View className="w-[1px] bg-border" />

                <View className="items-center">
                  <Text className="font-regular text-[11px] text-text-secondary mb-0.5">
                    Servings
                  </Text>
                  <Text className="font-bold text-sm text-text-primary">
                    {recipe.servings}
                  </Text>
                </View>
              </View>

              {/* Ingredients Checklist */}
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Ionicons name="basket-outline" size={18} color={colors.primaryDark} />
                    <Text className="font-bold text-base text-text-primary ml-2">
                      Ingredients
                    </Text>
                  </View>
                  <Text className="font-regular text-xs text-text-secondary">
                    Tap to check off
                  </Text>
                </View>

                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <View className="bg-surface rounded-2xl border border-border overflow-hidden">
                    {recipe.ingredients.map((ing, idx) => {
                      const idKey = ing.id || `${ing.name}-${idx}`;
                      const isChecked = Boolean(checkedIngredients[idKey]);
                      const isLast = idx === (recipe.ingredients?.length ?? 1) - 1;

                      return (
                        <TouchableOpacity
                          key={idKey}
                          activeOpacity={0.7}
                          onPress={() => toggleIngredient(idKey)}
                          className={`flex-row items-center justify-between p-3.5 ${
                            !isLast ? 'border-b border-border/70' : ''
                          }`}
                        >
                          <View className="flex-row items-center flex-1 pr-3">
                            <View
                              className={`w-5 h-5 rounded-md items-center justify-center mr-3 border ${
                                isChecked
                                  ? 'bg-primary border-primary'
                                  : 'bg-background border-border'
                              }`}
                            >
                              {isChecked && (
                                <Ionicons
                                  name="checkmark"
                                  size={13}
                                  color={colors.onPrimary || '#0F2A0F'}
                                />
                              )}
                            </View>

                            <Text
                              className={`text-sm font-medium ${
                                isChecked
                                  ? 'text-text-secondary line-through'
                                  : 'text-text-primary'
                              }`}
                            >
                              {ing.name}
                            </Text>
                          </View>

                          <Text
                            className={`font-semibold text-xs ${
                              isChecked ? 'text-text-secondary' : 'text-primary-dark'
                            }`}
                          >
                            {ing.quantity}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <Text className="font-regular text-xs text-text-secondary">
                    No ingredients listed.
                  </Text>
                )}
              </View>

              {/* Step-by-Step Instructions */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="book-outline" size={18} color={colors.primaryDark} />
                  <Text className="font-bold text-base text-text-primary ml-2">
                    Directions
                  </Text>
                </View>

                <View className="gap-3">
                  {steps.map((step, idx) => (
                    <View
                      key={idx}
                      className="bg-surface rounded-2xl border border-border p-4 flex-row items-start"
                    >
                      <View className="w-6 h-6 rounded-full bg-primary-tint items-center justify-center mr-3 mt-0.5">
                        <Text className="font-bold text-xs text-primary-dark">
                          {idx + 1}
                        </Text>
                      </View>
                      <Text className="font-regular text-sm text-text-primary leading-6 flex-1">
                        {step}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};
