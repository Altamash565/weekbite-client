import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { useUpdateRecipe } from '../hooks/useRecipes';
import { Recipe, RecipeCategory } from '../types/recipes.types';
import { colors, fonts } from '../../../shared/theme/tokens';

const CATEGORIES: RecipeCategory[] = [
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK',
  'DESSERT',
  'OTHER',
];

interface EditRecipeModalProps {
  recipe: Recipe | null | undefined;
  visible: boolean;
  onClose: () => void;
}

export const EditRecipeModal: React.FC<EditRecipeModalProps> = ({
  recipe,
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const updateMutation = useUpdateRecipe();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('DINNER');
  const [prepTime, setPrepTime] = useState('15');
  const [cookTime, setCookTime] = useState('20');
  const [servings, setServings] = useState('2');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState<Array<{ name: string; quantity: string }>>([
    { name: '', quantity: '' },
  ]);

  // Synchronize initial state when modal opens or recipe updates
  useEffect(() => {
    if (visible && recipe) {
      setTitle(recipe.title || '');
      setDescription(recipe.description || '');
      setCategory(recipe.category || 'DINNER');
      setPrepTime(String(recipe.prepTime ?? 15));
      setCookTime(String(recipe.cookTime ?? 20));
      setServings(String(recipe.servings ?? 2));
      setInstructions(recipe.instructions || '');

      if (recipe.ingredients && recipe.ingredients.length > 0) {
        setIngredients(
          recipe.ingredients.map((item) => ({
            name: item.name || '',
            quantity: item.quantity || '',
          }))
        );
      } else {
        setIngredients([{ name: '', quantity: '' }]);
      }
    }
  }, [visible, recipe]);

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
    if (!recipe) return;

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

    updateMutation.mutate(
      {
        id: recipe.id,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          prepTime: parsedPrep,
          cookTime: parsedCook,
          servings: parsedServings,
          instructions: instructions.trim(),
          ingredients: validIngredients,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Recipe Updated', 'Your changes have been saved.');
          onClose();
        },
        onError: (err) => {
          Alert.alert('Update Failed', err.message || 'Could not update recipe.');
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
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        {/* Navigation Bar */}
        <View className="flex-row items-center justify-between px-5 py-3.5 border-b border-neutral-100 bg-white">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="w-9 h-9 rounded-full bg-neutral-100 items-center justify-center"
          >
            <Ionicons name="close" size={18} color="#18181B" />
          </TouchableOpacity>

          <Text
            style={{ fontFamily: fonts.bold }}
            className="text-base font-bold text-neutral-900"
          >
            Edit Recipe
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSubmit}
            disabled={updateMutation.isPending}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="px-3.5 py-1.5 rounded-full bg-primary-dark items-center justify-center flex-row"
          >
            {updateMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{ fontFamily: fonts.bold }}
                className="text-xs font-bold text-white tracking-wide"
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Scrollable Form Body */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-5 pt-4"
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 32 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <View className="mb-4">
              <Text
                style={{ fontFamily: fonts.bold }}
                className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2"
              >
                Title *
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Recipe title"
                placeholderTextColor="#A1A1AA"
                style={{ fontFamily: fonts.regular }}
                className="bg-neutral-50 border border-neutral-200/80 rounded-xl px-3.5 py-3 text-sm text-neutral-900"
              />
            </View>

            {/* Category Selector */}
            <View className="mb-4">
              <Text
                style={{ fontFamily: fonts.bold }}
                className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2"
              >
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row py-1"
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.7}
                      onPress={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-full mr-2 border ${
                        isSelected
                          ? 'bg-primary-dark border-primary-dark'
                          : 'bg-neutral-100 border-neutral-200/70'
                      }`}
                    >
                      <Text
                        style={{ fontFamily: fonts.bold }}
                        className={`text-xs ${
                          isSelected ? 'text-white' : 'text-neutral-700'
                        }`}
                      >
                        {cat.charAt(0) + cat.slice(1).toLowerCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Quick Metrics (Prep, Cook, Servings) */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2"
                >
                  Prep (min) *
                </Text>
                <TextInput
                  value={prepTime}
                  onChangeText={setPrepTime}
                  keyboardType="numeric"
                  placeholder="15"
                  placeholderTextColor="#A1A1AA"
                  style={{ fontFamily: fonts.regular }}
                  className="bg-neutral-50 border border-neutral-200/80 rounded-xl px-3.5 py-3 text-sm text-neutral-900 text-center"
                />
              </View>

              <View className="flex-1">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2"
                >
                  Cook (min) *
                </Text>
                <TextInput
                  value={cookTime}
                  onChangeText={setCookTime}
                  keyboardType="numeric"
                  placeholder="20"
                  placeholderTextColor="#A1A1AA"
                  style={{ fontFamily: fonts.regular }}
                  className="bg-neutral-50 border border-neutral-200/80 rounded-xl px-3.5 py-3 text-sm text-neutral-900 text-center"
                />
              </View>

              <View className="flex-1">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2"
                >
                  Servings *
                </Text>
                <TextInput
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="numeric"
                  placeholder="2"
                  placeholderTextColor="#A1A1AA"
                  style={{ fontFamily: fonts.regular }}
                  className="bg-neutral-50 border border-neutral-200/80 rounded-xl px-3.5 py-3 text-sm text-neutral-900 text-center"
                />
              </View>
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text
                style={{ fontFamily: fonts.bold }}
                className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2"
              >
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Optional short summary or story"
                placeholderTextColor="#A1A1AA"
                multiline
                numberOfLines={2}
                style={{ fontFamily: fonts.regular }}
                className="bg-neutral-50 border border-neutral-200/80 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 min-h-[64px]"
              />
            </View>

            {/* Ingredients Section */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-xs font-bold text-neutral-800 uppercase tracking-wider"
                >
                  Ingredients *
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleAddIngredientRow}
                  className="flex-row items-center px-2 py-1 rounded bg-neutral-100"
                >
                  <Ionicons name="add" size={14} color={colors.primaryDark} />
                  <Text
                    style={{ fontFamily: fonts.bold }}
                    className="text-[11px] text-primary-dark ml-0.5"
                  >
                    Add Row
                  </Text>
                </TouchableOpacity>
              </View>

              {ingredients.map((item, idx) => (
                <View key={idx} className="flex-row items-center gap-2 mb-2">
                  <TextInput
                    value={item.name}
                    onChangeText={(val) => handleUpdateIngredient(idx, 'name', val)}
                    placeholder="e.g. Olive oil"
                    placeholderTextColor="#A1A1AA"
                    style={{ fontFamily: fonts.regular }}
                    className="flex-[2] bg-neutral-50 border border-neutral-200/80 rounded-xl px-3 py-2.5 text-xs text-neutral-900"
                  />
                  <TextInput
                    value={item.quantity}
                    onChangeText={(val) => handleUpdateIngredient(idx, 'quantity', val)}
                    placeholder="e.g. 2 tbsp"
                    placeholderTextColor="#A1A1AA"
                    style={{ fontFamily: fonts.regular }}
                    className="flex-1 bg-neutral-50 border border-neutral-200/80 rounded-xl px-3 py-2.5 text-xs text-neutral-900"
                  />
                  {ingredients.length > 1 && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleRemoveIngredientRow(idx)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      className="p-1"
                    >
                      <Ionicons name="close-circle" size={18} color="#A1A1AA" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Instructions */}
            <View className="mb-6">
              <Text
                style={{ fontFamily: fonts.bold }}
                className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2"
              >
                Instructions *
              </Text>
              <TextInput
                value={instructions}
                onChangeText={setInstructions}
                placeholder="Step 1: Prep ingredients...&#10;Step 2: Cook on medium..."
                placeholderTextColor="#A1A1AA"
                multiline
                numberOfLines={5}
                style={{ fontFamily: fonts.regular, textAlignVertical: 'top' }}
                className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-3 text-sm text-neutral-900 min-h-[120px]"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

