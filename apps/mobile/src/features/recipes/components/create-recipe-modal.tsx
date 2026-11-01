import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCreateRecipe } from '../hooks/useRecipes';
import { RecipeCategory } from '../types/recipes.types';
import { colors } from '../../../shared/theme/tokens';

const CATEGORIES: RecipeCategory[] = [
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK',
  'DESSERT',
  'OTHER',
];

interface CreateRecipeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateRecipeModal: React.FC<CreateRecipeModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const createMutation = useCreateRecipe();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('DINNER');
  const [prepTime, setPrepTime] = useState('15');
  const [cookTime, setCookTime] = useState('20');
  const [servings, setServings] = useState('2');
  const [instructions, setInstructions] = useState('');

  const [ingredients, setIngredients] = useState<Array<{ name: string; quantity: string }>>([
    { name: '', quantity: '' },
  ]);

  const handleAddIngredientRow = () => {
    setIngredients((prev) => [...prev, { name: '', quantity: '' }]);
  };

  const handleRemoveIngredientRow = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateIngredient = (
    index: number,
    field: 'name' | 'quantity',
    value: string
  ) => {
    setIngredients((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = () => {
    if (title.trim().length < 3) {
      Alert.alert('Validation Error', 'Title must be at least 3 characters.');
      return;
    }

    const parsedPrep = parseInt(prepTime, 10);
    const parsedCook = parseInt(cookTime, 10);
    const parsedServings = parseInt(servings, 10);

    if (isNaN(parsedPrep) || parsedPrep < 0) {
      Alert.alert('Validation Error', 'Please enter a valid preparation time.');
      return;
    }

    if (isNaN(parsedCook) || parsedCook < 0) {
      Alert.alert('Validation Error', 'Please enter a valid cooking time.');
      return;
    }

    if (isNaN(parsedServings) || parsedServings < 1) {
      Alert.alert('Validation Error', 'Servings must be at least 1.');
      return;
    }

    const validIngredients = ingredients
      .map((i) => ({ name: i.name.trim(), quantity: i.quantity.trim() }))
      .filter((i) => Boolean(i.name && i.quantity));

    if (validIngredients.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one ingredient with a quantity.');
      return;
    }

    if (instructions.trim().length < 10) {
      Alert.alert('Validation Error', 'Instructions must be at least 10 characters.');
      return;
    }

    createMutation.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        image: image.trim() || undefined,
        category,
        prepTime: parsedPrep,
        cookTime: parsedCook,
        servings: parsedServings,
        instructions: instructions.trim(),
        ingredients: validIngredients,
      },
      {
        onSuccess: () => {
          Alert.alert('Recipe Created', 'Your recipe has been published to your catalog.');
          onClose();
        },
        onError: (err) => {
          Alert.alert('Creation Failed', err.message || 'Could not create recipe.');
        },
      }
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        {/* Navigation Bar */}
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-border bg-surface">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="w-9 h-9 rounded-full bg-background border border-border items-center justify-center"
          >
            <Ionicons name="close" size={18} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text className="font-semibold text-sm text-text-primary">Create New Recipe</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
            className="px-3.5 py-1.5 rounded-full bg-primary"
          >
            <Text className="font-semibold text-xs text-on-primary">
              {createMutation.isPending ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-5 pt-4"
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <View className="mb-4">
              <Text className="font-medium text-xs text-text-secondary mb-1">
                Recipe Title *
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Creamy Tuscan Garlic Pasta"
                placeholderTextColor={colors.textSecondary}
                className="bg-surface rounded-xl border border-border px-3.5 h-[48px] text-sm text-text-primary"
              />
            </View>

            {/* Category Selector */}
            <View className="mb-4">
              <Text className="font-medium text-xs text-text-secondary mb-1.5">
                Category *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-full border ${
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
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Cooking Times & Servings */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="font-medium text-xs text-text-secondary mb-1">
                  Prep Time (min)
                </Text>
                <TextInput
                  value={prepTime}
                  onChangeText={setPrepTime}
                  keyboardType="numeric"
                  className="bg-surface rounded-xl border border-border px-3.5 h-[48px] text-sm text-text-primary"
                />
              </View>

              <View className="flex-1">
                <Text className="font-medium text-xs text-text-secondary mb-1">
                  Cook Time (min)
                </Text>
                <TextInput
                  value={cookTime}
                  onChangeText={setCookTime}
                  keyboardType="numeric"
                  className="bg-surface rounded-xl border border-border px-3.5 h-[48px] text-sm text-text-primary"
                />
              </View>

              <View className="flex-1">
                <Text className="font-medium text-xs text-text-secondary mb-1">
                  Servings
                </Text>
                <TextInput
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="numeric"
                  className="bg-surface rounded-xl border border-border px-3.5 h-[48px] text-sm text-text-primary"
                />
              </View>
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="font-medium text-xs text-text-secondary mb-1">
                Description (Optional)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Brief summary of this dish..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
                className="bg-surface rounded-xl border border-border p-3 text-sm text-text-primary min-h-[64px]"
              />
            </View>

            {/* Image URL */}
            <View className="mb-5">
              <Text className="font-medium text-xs text-text-secondary mb-1">
                Image URL (Optional)
              </Text>
              <TextInput
                value={image}
                onChangeText={setImage}
                placeholder="https://images.unsplash.com/..."
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                keyboardType="url"
                className="bg-surface rounded-xl border border-border px-3.5 h-[48px] text-sm text-text-primary"
              />
            </View>

            {/* Ingredients Section */}
            <View className="mb-5">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-bold text-sm text-text-primary">
                  Ingredients *
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleAddIngredientRow}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="flex-row items-center"
                >
                  <Ionicons name="add-circle" size={16} color={colors.primaryDark} />
                  <Text className="font-semibold text-xs text-primary-dark ml-1">
                    Add item
                  </Text>
                </TouchableOpacity>
              </View>

              {ingredients.map((ing, idx) => (
                <View key={idx} className="flex-row items-center gap-2 mb-2">
                  <TextInput
                    value={ing.name}
                    onChangeText={(val) => handleUpdateIngredient(idx, 'name', val)}
                    placeholder="Ingredient (e.g. Pasta)"
                    placeholderTextColor={colors.textSecondary}
                    className="flex-2 bg-surface rounded-xl border border-border px-3 h-[44px] text-sm text-text-primary"
                  />
                  <TextInput
                    value={ing.quantity}
                    onChangeText={(val) => handleUpdateIngredient(idx, 'quantity', val)}
                    placeholder="Qty (e.g. 200g)"
                    placeholderTextColor={colors.textSecondary}
                    className="flex-1 bg-surface rounded-xl border border-border px-3 h-[44px] text-sm text-text-primary"
                  />
                  {ingredients.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveIngredientRow(idx)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      className="w-8 h-8 rounded-full items-center justify-center bg-background border border-border"
                    >
                      <Ionicons
                        name="close"
                        size={15}
                        color={colors.error || '#D64545'}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Instructions */}
            <View className="mb-6">
              <Text className="font-bold text-sm text-text-primary mb-1">
                Instructions *
              </Text>
              <TextInput
                value={instructions}
                onChangeText={setInstructions}
                placeholder="1. Boil pasta in salted water...&#10;2. Sauté garlic and tomatoes...&#10;3. Combine and serve warm."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                className="bg-surface rounded-xl border border-border p-3 text-sm text-text-primary min-h-[120px]"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

