import React, { ComponentRef, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useDeleteRecipe, useFavorites, useRecipeDetail, useToggleFavorite } from '../hooks/useRecipes';
import { useCurrentUser } from '../../auth';
import { fonts } from '../../../shared/theme/tokens';
import { EditRecipeModal } from '../components/edit-recipe-modal';

interface RecipeDetailScreenProps {
  recipeId: string;
  onBack: () => void;
}

const formatCategory = (category: string): string => {
  if (!category) return 'Recipe';
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};

const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '—';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
};

/**
 * Bold Bookmark Vector Icon matching the visual stroke weight of FontAwesome6 pen-to-square.
 * When not favorited, applies synthetic multi-directional vector offsets to match the bold
 * outline styling seen in Bluesky action sheet icons.
 */
const BoldBookmarkIcon: React.FC<{
  size: number;
  color: string;
  isFavorited: boolean;
}> = ({ size, color, isFavorited }) => {
  if (isFavorited) {
    return (
      <FontAwesome6
        name="bookmark"
        size={size}
        color="#16A34A"
        solid
      />
    );
  }

  return (
    <View className="items-center justify-center">
      {/* 4-way synthetic bolding offsets for crisp, bold vector stroke */}
      <FontAwesome6
        name="bookmark"
        size={size}
        color={color}
        style={{
          position: 'absolute',
          transform: [{ translateX: -0.4 }, { translateY: 0 }],
        }}
      />
      <FontAwesome6
        name="bookmark"
        size={size}
        color={color}
        style={{
          position: 'absolute',
          transform: [{ translateX: 0.4 }, { translateY: 0 }],
        }}
      />
      <FontAwesome6
        name="bookmark"
        size={size}
        color={color}
        style={{
          position: 'absolute',
          transform: [{ translateX: 0 }, { translateY: -0.4 }],
        }}
      />
      <FontAwesome6
        name="bookmark"
        size={size}
        color={color}
        style={{
          position: 'absolute',
          transform: [{ translateX: 0 }, { translateY: 0.4 }],
        }}
      />
      <FontAwesome6 name="bookmark" size={size} color={color} />
    </View>
  );
};

export const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({
  recipeId,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { data: user } = useCurrentUser();
  const { data: recipe, isLoading, error } = useRecipeDetail(recipeId);
  const { data: favorites = [] } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();
  const deleteMutation = useDeleteRecipe();

  const isFavorited = useMemo(() => {
    return favorites.some((f) => f.recipeId === recipeId);
  }, [favorites, recipeId]);

  // Checked ingredients for active cooking session
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const toggleIngredient = (key: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Entrance & Exit Transition Animation (Minimal & Real)
  const translateX = useSharedValue(24);
  const opacity = useSharedValue(0);
  const isClosingRef = useRef(false);

  useEffect(() => {
    translateX.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [opacity, translateX]);

  const handleBack = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    translateX.value = withTiming(24, {
      duration: 160,
      easing: Easing.in(Easing.cubic),
    });
    opacity.value = withTiming(
      0,
      {
        duration: 160,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(onBack)();
        }
      }
    );
  };



  const isOwner = Boolean(
    user && recipe && (user.id === recipe.createdById || user.id === recipe.createdBy?.id)
  );

  const handleDelete = () => {
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
                handleBack();
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

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate({ recipeId, isFavorited });
  };

  // Controlled bottom sheet state & animations
  const [isSheetMounted, setIsSheetMounted] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const sheetProgress = useSharedValue(0);

  const openActionSheet = () => {
    setIsSheetMounted(true);
    sheetProgress.value = withTiming(1, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  };

  const closeActionSheet = (callback?: () => void) => {
    sheetProgress.value = withTiming(
      0,
      {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(setIsSheetMounted)(false);
          if (callback) {
            runOnJS(callback)();
          }
        }
      }
    );
  };

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sheetProgress.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - sheetProgress.value) * 380 }],
  }));

  // Hardware Back Button (Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isSheetMounted) {
        closeActionSheet();
        return true;
      }
      handleBack();
      return true;
    });

    return () => backHandler.remove();
  }, [isSheetMounted]);

  // Parse multi-step instructions into clean numbered lines
  const steps = useMemo(() => {
    if (!recipe?.instructions) return [];
    return recipe.instructions
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => Boolean(s));
  }, [recipe?.instructions]);

  const animatedScreenStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const totalTime = (recipe?.prepTime || 0) + (recipe?.cookTime || 0);

  return (
    <Animated.View
      style={[animatedScreenStyle, { paddingTop: insets.top }]}
      className="flex-1 bg-white relative"
    >
      <StatusBar style="dark" />

      <View className="flex-1">
        {/* Top Navigation Bar */}
      <View className="px-5 py-3 border-b border-neutral-100 flex-row items-center justify-between bg-white z-10">
        {/* Simple Back Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="w-9 h-9 items-center justify-center -ml-1"
        >
          <Ionicons name="arrow-back" size={24} color="#18181B" />
        </TouchableOpacity>

        {/* Page Heading (Bold Category / Title) */}
        <Text
          style={{ fontFamily: fonts.bold }}
          className="text-base font-bold text-neutral-900 tracking-tight"
        >
          {recipe ? formatCategory(recipe.category) : 'Recipe Details'}
        </Text>

        {/* Three Dot Action Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openActionSheet}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="w-10 h-10 rounded-[10px] bg-neutral-100 border border-neutral-200/80 items-center justify-center"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#18181B" />
        </TouchableOpacity>
      </View>

      {/* Body Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1F8A1F" />
          <Text
            style={{ fontFamily: fonts.medium }}
            className="text-xs text-neutral-400 mt-3"
          >
            Loading recipe...
          </Text>
        </View>
      ) : error || !recipe ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={36} color="#DC2626" />
          <Text
            style={{ fontFamily: fonts.bold }}
            className="text-base text-neutral-800 mt-2 text-center"
          >
            Unable to load recipe
          </Text>
          <Text
            style={{ fontFamily: fonts.regular }}
            className="text-xs text-neutral-500 mt-1 text-center"
          >
            {error?.message || 'Recipe details not found'}
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            className="mt-5 px-4 py-2 bg-neutral-100 rounded-lg"
          >
            <Text style={{ fontFamily: fonts.semiBold }} className="text-xs text-neutral-800">
              Go back
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          scrollEnabled={!isSheetMounted}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom + 28, 40),
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Image Banner (if available) */}
          {Boolean(recipe.image) && (
            <View className="w-full h-64 bg-neutral-100 border-b border-neutral-100">
              <Image
                source={{ uri: recipe.image! }}
                className="w-full h-full"
                resizeMode="cover"
                blurRadius={isSheetMounted ? 30 : 0}
              />
            </View>
          )}

          <View className="px-5 pt-4">
            {/* Category Heading (Bold Badge) */}
            <View className="flex-row items-center mb-2.5">
              <View className="bg-[#EBF7EB] px-3 py-1 rounded-[8px]">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-xs font-bold text-[#1E7D2D] uppercase tracking-wider"
                >
                  {formatCategory(recipe.category)}
                </Text>
              </View>
            </View>

            {/* Recipe Title */}
            <Text
              style={{
                fontFamily: fonts.bold,
                fontSize: 24,
                lineHeight: 30,
                letterSpacing: -0.4,
              }}
              className="text-neutral-900 mb-4"
            >
              {recipe.title}
            </Text>

            {/* Section 1: About / Description */}
            {Boolean(recipe.description) && (
              <View className="mb-6">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-base text-neutral-900 mb-2"
                >
                  About Recipe
                </Text>
                <Text
                  style={{ fontFamily: fonts.regular }}
                  className="text-sm text-neutral-600 leading-relaxed"
                >
                  {recipe.description}
                </Text>
              </View>
            )}

            {/* Section 2: Time & Servings (Eye-Catchy, Distinct Cards) */}
            <View className="mb-6">
              <Text
                style={{ fontFamily: fonts.bold }}
                className="text-base text-neutral-900 mb-3"
              >
                Time & Servings
              </Text>

              {/* 2x2 Grid of Distinct, Eye-Catchy Spec Cards */}
              <View className="gap-2.5">
                {/* Row 1: Prep & Cook */}
                <View className="flex-row gap-2.5">
                  {/* Card 1: Prep Time */}
                  <View className="flex-1 p-3.5 rounded-[16px] bg-[#F7F9F6] border border-[#E7EDE5]">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text
                        style={{ fontFamily: fonts.bold }}
                        className="text-[10px] text-neutral-400 uppercase tracking-wider"
                      >
                        Prep Time
                      </Text>
                      <View className="w-6 h-6 rounded-full bg-[#EBF7EB] items-center justify-center">
                        <Ionicons name="timer-outline" size={13} color="#1E7D2D" />
                      </View>
                    </View>
                    <Text
                      style={{ fontFamily: fonts.bold }}
                      className="text-[17px] text-neutral-900"
                    >
                      {formatDuration(recipe.prepTime)}
                    </Text>
                  </View>

                  {/* Card 2: Cook Time */}
                  <View className="flex-1 p-3.5 rounded-[16px] bg-[#FFFBF4] border border-[#FDECD4]">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text
                        style={{ fontFamily: fonts.bold }}
                        className="text-[10px] text-neutral-400 uppercase tracking-wider"
                      >
                        Cook Time
                      </Text>
                      <View className="w-6 h-6 rounded-full bg-[#FEF3C7] items-center justify-center">
                        <Ionicons name="flame-outline" size={13} color="#D97706" />
                      </View>
                    </View>
                    <Text
                      style={{ fontFamily: fonts.bold }}
                      className="text-[17px] text-neutral-900"
                    >
                      {formatDuration(recipe.cookTime)}
                    </Text>
                  </View>
                </View>

                {/* Row 2: Total Time & Servings */}
                <View className="flex-row gap-2.5">
                  {/* Card 3: Total Time */}
                  <View className="flex-1 p-3.5 rounded-[16px] bg-[#F6F8FC] border border-[#E3EAF7]">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text
                        style={{ fontFamily: fonts.bold }}
                        className="text-[10px] text-neutral-400 uppercase tracking-wider"
                      >
                        Total Time
                      </Text>
                      <View className="w-6 h-6 rounded-full bg-[#EFF6FF] items-center justify-center">
                        <Ionicons name="hourglass-outline" size={13} color="#2563EB" />
                      </View>
                    </View>
                    <Text
                      style={{ fontFamily: fonts.bold }}
                      className="text-[17px] text-neutral-900"
                    >
                      {formatDuration(totalTime)}
                    </Text>
                  </View>

                  {/* Card 4: Servings */}
                  <View className="flex-1 p-3.5 rounded-[16px] bg-[#FBF7FB] border border-[#F3E7F3]">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text
                        style={{ fontFamily: fonts.bold }}
                        className="text-[10px] text-neutral-400 uppercase tracking-wider"
                      >
                        Servings
                      </Text>
                      <View className="w-6 h-6 rounded-full bg-[#FCE7F3] items-center justify-center">
                        <Ionicons name="people-outline" size={13} color="#BE185D" />
                      </View>
                    </View>
                    <Text
                      style={{ fontFamily: fonts.bold }}
                      className="text-[17px] text-neutral-900"
                    >
                      {recipe.servings || 1} {recipe.servings === 1 ? 'serving' : 'servings'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Section 3: Ingredients */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-base text-neutral-900"
                >
                  Ingredients
                </Text>
                {Boolean(recipe.ingredients && recipe.ingredients.length > 0) && (
                  <View className="bg-neutral-100 px-2.5 py-0.5 rounded-full">
                    <Text
                      style={{ fontFamily: fonts.semiBold }}
                      className="text-xs text-neutral-600"
                    >
                      {recipe.ingredients!.length} items
                    </Text>
                  </View>
                )}
              </View>

              {Boolean(recipe.ingredients && recipe.ingredients.length > 0) ? (
                <View className="bg-neutral-50/70 rounded-[16px] border border-neutral-100 divide-y divide-neutral-100 overflow-hidden">
                  {recipe.ingredients!.map((ing, idx) => {
                    const itemKey = ing.id || `${ing.name}-${idx}`;
                    const isChecked = Boolean(checkedIngredients[itemKey]);

                    return (
                      <TouchableOpacity
                        key={itemKey}
                        activeOpacity={0.65}
                        onPress={() => toggleIngredient(itemKey)}
                        className="flex-row items-center py-3 px-3.5"
                      >
                        {/* Checkbox */}
                        <View
                          className={`w-5 h-5 rounded-full border items-center justify-center mr-3 ${
                            isChecked
                              ? 'bg-primary border-primary'
                              : 'border-neutral-300 bg-white'
                          }`}
                        >
                          {isChecked && (
                            <Ionicons name="checkmark" size={12} color="#0F2A0F" />
                          )}
                        </View>

                        {/* Ingredient Text */}
                        <Text
                          style={{
                            fontFamily: isChecked ? fonts.regular : fonts.medium,
                          }}
                          className={`flex-1 text-[13.5px] ${
                            isChecked
                              ? 'text-neutral-400 line-through'
                              : 'text-neutral-800'
                          }`}
                        >
                          {ing.quantity ? `${ing.quantity} ` : ''}
                          {ing.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                  <Text
                    style={{ fontFamily: fonts.regular }}
                    className="text-xs text-neutral-400 text-center"
                  >
                    No ingredients listed for this recipe.
                  </Text>
                </View>
              )}
            </View>

            {/* Section 4: Instructions */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-base text-neutral-900"
                >
                  Instructions
                </Text>
                {steps.length > 0 && (
                  <View className="bg-neutral-100 px-2.5 py-0.5 rounded-full">
                    <Text
                      style={{ fontFamily: fonts.semiBold }}
                      className="text-xs text-neutral-600"
                    >
                      {steps.length} {steps.length === 1 ? 'step' : 'steps'}
                    </Text>
                  </View>
                )}
              </View>

              {steps.length > 0 ? (
                <View className="space-y-3">
                  {steps.map((step, idx) => (
                    <View key={idx} className="flex-row items-start mb-3.5">
                      {/* Step Number Circle */}
                      <View className="w-6 h-6 rounded-full bg-neutral-100 items-center justify-center mr-3 mt-0.5">
                        <Text
                          style={{ fontFamily: fonts.bold }}
                          className="text-xs text-neutral-700"
                        >
                          {idx + 1}
                        </Text>
                      </View>

                      {/* Step Description */}
                      <Text
                        style={{ fontFamily: fonts.regular }}
                        className="flex-1 text-[14px] text-neutral-800 leading-relaxed"
                      >
                        {step}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                  <Text
                    style={{ fontFamily: fonts.regular }}
                    className="text-xs text-neutral-400 text-center"
                  >
                    No instructions added for this recipe.
                  </Text>
                </View>
              )}
            </View>

            {/* Section 5: Recipe Metadata Footer */}
            {Boolean(recipe.createdBy?.name || recipe.createdAt) && (
              <View className="pt-4 pb-2 border-t border-neutral-100 flex-row items-center justify-between">
                {Boolean(recipe.createdBy?.name) && (
                  <Text
                    style={{ fontFamily: fonts.medium }}
                    className="text-xs text-neutral-400"
                  >
                    By {recipe.createdBy!.name}
                  </Text>
                )}
                {Boolean(recipe.createdAt) && (
                  <Text
                    style={{ fontFamily: fonts.regular }}
                    className="text-[11px] text-neutral-400"
                  >
                    Added {new Date(recipe.createdAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      )}
      </View>

      {/* Three-Dot Actions Modal Sheet */}
      {isSheetMounted && (
        <View style={StyleSheet.absoluteFill} className="z-50 justify-end">
          {/* Classic Dimmed Backdrop */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              backdropAnimatedStyle,
              { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
            ]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => closeActionSheet()}
            />
          </Animated.View>

          {/* Modal Sheet Container with Smooth Slide-Up Animation */}
          <Animated.View
            style={[
              sheetAnimatedStyle,
              { paddingBottom: Math.max(insets.bottom + 8, 24) },
            ]}
            className="bg-white rounded-t-[28px] px-4 pt-2.5 shadow-2xl"
          >
            {/* Minimal Drag Indicator */}
            <View className="w-10 h-1 rounded-full bg-neutral-300 self-center mb-3 mt-0.5" />

            {/* Action Group 1 */}
            <View className="bg-[#F1F5F9] rounded-[22px] overflow-hidden mb-2.5">
              {/* 1. Favourite Option */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => closeActionSheet(() => handleToggleFavorite())}
                className="flex-row items-center justify-between px-4 py-4 active:bg-neutral-200/50"
              >
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-[16px] font-bold text-neutral-900"
                >
                  {isFavorited ? 'Remove from Favourites' : 'Add to Favourites'}
                </Text>
                <View className="w-6 h-6 items-center justify-center">
                  <FontAwesome6
                    name="bookmark"
                    size={19}
                    color={isFavorited ? '#16A34A' : '#0F172A'}
                    solid={isFavorited}
                  />
                </View>
              </TouchableOpacity>

              {/* Subtle Hairline Divider */}
              <View className="h-[1px] bg-neutral-200/60 mx-4" />

              {/* 2. Edit Option */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  closeActionSheet(() => {
                    if (!isOwner) {
                      Alert.alert(
                        'Permission Denied',
                        'You can only edit recipes that you created.'
                      );
                      return;
                    }
                    setIsEditModalOpen(true);
                  })
                }
                className="flex-row items-center justify-between px-4 py-4 active:bg-neutral-200/50"
              >
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-[16px] font-bold text-neutral-900"
                >
                  Edit Recipe
                </Text>
                <View className="w-6 h-6 items-center justify-center">
                  <FontAwesome6 name="pen-to-square" size={19} color="#0F172A" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Action Group 2 (Destructive) */}
            <View className="bg-[#F1F5F9] rounded-[22px] overflow-hidden">
              {/* 3. Delete Option */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  closeActionSheet(() => {
                    if (!isOwner) {
                      Alert.alert(
                        'Permission Denied',
                        'You can only edit recipes that you created.'
                      );
                      return;
                    }
                    handleDelete();
                  })
                }  
                className="flex-row items-center justify-between px-4 py-4 active:bg-red-100/50"
              >
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-[16px] font-bold text-red-600"
                >
                  Delete Recipe
                </Text>
                <View className="w-6 h-6 items-center justify-center">
                  <Ionicons name="trash-outline" size={21} color="#DC2626" />
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Edit Recipe Modal */}
      <EditRecipeModal
        visible={isEditModalOpen}
        recipe={recipe}
        onClose={() => setIsEditModalOpen(false)}
      />
    </Animated.View>
  );
};
