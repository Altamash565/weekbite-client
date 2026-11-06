import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../types/recipes.types';
import { colors } from '../../../shared/theme/tokens';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorited?: boolean;
  layout?: 'grid' | 'list';
  onPress: () => void;
  onToggleFavorite: (recipeId: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorited = false,
  layout = 'grid',
  onPress,
  onToggleFavorite,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const totalTime = recipe.prepTime + recipe.cookTime;

  if (layout === 'grid') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        className="bg-surface rounded-2xl border border-border overflow-hidden mb-3.5 flex-1 mx-1.5"
      >
        {/* Thumbnail with floating badge overlays */}
        <View className="relative w-full h-36 bg-[#F1F5F9] items-center justify-center">
          {recipe.image && !imageError ? (
            <Image
              source={{ uri: recipe.image }}
              className="w-full h-full"
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="w-full h-full bg-[#F1F5F9] items-center justify-center">
              <Ionicons name="restaurant-outline" size={26} color="#94A3B8" />
            </View>
          )}

          {/* Time Badge (Top Left Floating) */}
          {totalTime > 0 && (
            <View className="absolute top-2.5 left-2.5 bg-black/50 px-2 py-0.5 rounded-full flex-row items-center">
              <Ionicons name="time-outline" size={11} color="#FFFFFF" />
              <Text className="text-[10px] font-semibold text-white ml-1">
                {totalTime}m
              </Text>
            </View>
          )}

          {/* Favorite Heart Button (Top Right Floating) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onToggleFavorite(recipe.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 items-center justify-center"
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={15}
              color={isFavorited ? colors.error || '#D64545' : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="p-3">
          <Text className="text-[10px] font-bold text-primary-dark uppercase tracking-wider mb-1">
            {recipe.category}
          </Text>

          <Text
            className="font-bold text-sm text-text-primary leading-snug mb-1"
            numberOfLines={2}
          >
            {recipe.title}
          </Text>

          <Text className="font-regular text-[11px] text-text-secondary">
            {recipe.servings} {recipe.servings === 1 ? 'serv' : 'servs'}
            {recipe.ingredients && recipe.ingredients.length > 0
              ? ` • ${recipe.ingredients.length} ingr`
              : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // List layout
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="bg-surface rounded-2xl border border-border p-3.5 mb-3 flex-row items-center"
    >
      {/* Thumbnail */}
      <View className="w-20 h-20 rounded-xl overflow-hidden bg-[#F1F5F9] mr-3 relative items-center justify-center border border-neutral-200/50">
        {recipe.image && !imageError ? (
          <Image
            source={{ uri: recipe.image }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Ionicons name="restaurant-outline" size={22} color="#94A3B8" />
        )}
      </View>

      {/* Details */}
      <View className="flex-1 pr-2">
        <View className="flex-row items-center mb-1">
          <View className="bg-primary-tint px-2 py-0.5 rounded mr-2">
            <Text className="font-semibold text-[9px] text-primary-dark uppercase tracking-wider">
              {recipe.category}
            </Text>
          </View>
          <Text className="font-medium text-xs text-text-secondary">
            {totalTime} mins
          </Text>
        </View>

        <Text className="font-bold text-base text-text-primary mb-1" numberOfLines={1}>
          {recipe.title}
        </Text>

        <Text className="font-regular text-xs text-text-secondary" numberOfLines={1}>
          {recipe.servings} servings
          {recipe.ingredients && recipe.ingredients.length > 0
            ? ` • ${recipe.ingredients.length} ingredients`
            : ''}
        </Text>
      </View>

      {/* Heart */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onToggleFavorite(recipe.id)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        className="w-9 h-9 rounded-full bg-background border border-border items-center justify-center"
      >
        <Ionicons
          name={isFavorited ? 'heart' : 'heart-outline'}
          size={17}
          color={isFavorited ? colors.error || '#D64545' : colors.textSecondary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
