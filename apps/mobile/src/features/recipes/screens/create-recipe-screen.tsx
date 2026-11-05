import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
  ScaleDecorator,
} from '../../../shared/components/draggable-list';
import { useCreateRecipe } from '../hooks/useRecipes';
import { RecipeCategory } from '../types/recipes.types';
import { fonts } from '../../../shared/theme/tokens';
import { toast } from '../../../shared/services/toast';

export interface DraggableItem {
  id: string;
  text: string;
}

interface CategoryOption {
  value: RecipeCategory;
  label: string;
  description: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: 'BREAKFAST',
    label: 'Breakfast',
    description: 'Morning meals & smoothies',
  },
  {
    value: 'LUNCH',
    label: 'Lunch',
    description: 'Midday meals & sandwiches',
  },
  {
    value: 'DINNER',
    label: 'Dinner',
    description: 'Evening mains & hearty dishes',
  },
  {
    value: 'SNACK',
    label: 'Snack',
    description: 'Bites & quick snacks',
  },
  {
    value: 'DESSERT',
    label: 'Dessert',
    description: 'Sweet treats & pastries',
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Drinks, sauces & sides',
  },
];

/**
 * Smart line parser for ingredients entered or pasted as multi-line text.
 * Example inputs:
 *  - "2 cups all-purpose flour" -> { quantity: "2 cups", name: "all-purpose flour" }
 *  - "1 1/2 tbsp olive oil"     -> { quantity: "1 1/2 tbsp", name: "olive oil" }
 *  - "3 eggs"                   -> { quantity: "3", name: "eggs" }
 *  - "salt and pepper"          -> { quantity: "1", name: "salt and pepper" }
 */
export const parseIngredientLine = (line: string): { name: string; quantity: string } | null => {
  const trimmed = line.trim();
  // Skip empty lines or section headers ending with ":"
  if (!trimmed || trimmed.endsWith(':')) return null;

  const qtyRegex = /^((?:\d+\s+)?\d+(?:\/\d+|\.\d+)?|\d+)(?:\s*(cups?|tbsp|tsp|tablespoons?|teaspoons?|g|kg|ml|oz|lbs?|cloves?|pinch(?:es)?|slices?|cans?|pieces?|bunch(?:es)?|handfuls?|sprigs?|stalks?|heads?|packets?))?\s+(.*)$/i;
  const match = trimmed.match(qtyRegex);

  if (match && match[3]) {
    const qty = (match[1] + (match[2] ? ' ' + match[2] : '')).trim();
    const name = match[3].trim();
    if (name) {
      return { quantity: qty, name };
    }
  }

  // Fallback: entire line is the name
  return { quantity: '1', name: trimmed };
};

export const parseIngredientsList = (text: string) => {
  return text
    .split('\n')
    .map(parseIngredientLine)
    .filter((item): item is { name: string; quantity: string } => Boolean(item && item.name));
};

interface CreateRecipeScreenProps {
  onBack: () => void;
}

export const CreateRecipeScreen: React.FC<CreateRecipeScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const createMutation = useCreateRecipe();

  // Entrance & Exit Transition Animation
  const translateX = useSharedValue(28);
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
    translateX.value = withTiming(28, {
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

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, []);

  const animatedScreenStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  // Form Fields State matching reference design
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<DraggableItem[]>([
    { id: 'ing-1', text: '' },
  ]);
  const [instructions, setInstructions] = useState<DraggableItem[]>([
    { id: 'inst-1', text: '' },
  ]);
  const [servings, setServings] = useState('');
  const [prepHours, setPrepHours] = useState('');
  const [prepMinutes, setPrepMinutes] = useState('');
  const [cookHours, setCookHours] = useState('');
  const [cookMinutes, setCookMinutes] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('DINNER');

  // Ingredient List Handlers
  const handleAddIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { id: `ing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: '' },
    ]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => {
      if (prev.length <= 1) {
        return [{ id: `ing-${Date.now()}`, text: '' }];
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleUpdateIngredient = (id: string, text: string) => {
    if (text.includes('\n')) {
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        setIngredients((prev) => {
          const idx = prev.findIndex((item) => item.id === id);
          if (idx === -1) return prev;
          const newItems: DraggableItem[] = lines.map((line, i) => ({
            id: i === 0 ? id : `ing-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            text: line,
          }));
          const next = [...prev];
          next.splice(idx, 1, ...newItems);
          return next;
        });
        return;
      }
    }
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  // Instruction List Handlers
  const handleAddInstruction = () => {
    setInstructions((prev) => [
      ...prev,
      { id: `inst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: '' },
    ]);
  };

  const handleRemoveInstruction = (id: string) => {
    setInstructions((prev) => {
      if (prev.length <= 1) {
        return [{ id: `inst-${Date.now()}`, text: '' }];
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleUpdateInstruction = (id: string, text: string) => {
    if (text.includes('\n')) {
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        setInstructions((prev) => {
          const idx = prev.findIndex((item) => item.id === id);
          if (idx === -1) return prev;
          const newItems: DraggableItem[] = lines.map((line, i) => ({
            id: i === 0 ? id : `inst-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            text: line,
          }));
          const next = [...prev];
          next.splice(idx, 1, ...newItems);
          return next;
        });
        return;
      }
    }
    setInstructions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  // Category Selector Dropdown State & Coordinates
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    openUpwards: boolean;
    maxHeight: number;
  }>({
    x: 0,
    y: 0,
    width: 0,
    height: 48,
    openUpwards: false,
    maxHeight: 260,
  });

  const triggerRef = useRef<React.ElementRef<typeof View>>(null);
  const chevronRotation = useSharedValue(0);

  const openCategoryDropdown = () => {
    Keyboard.dismiss();
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        const safeBottom = Math.max(insets.bottom, 16);
        const safeTop = Math.max(insets.top, 16);
        const triggerHeight = height || 48;
        const spaceBelow = windowHeight - (y + triggerHeight) - safeBottom;
        const spaceAbove = y - safeTop;
        const desiredHeight = 260;

        // If space below is insufficient for dropdown and space above has more room, open upwards
        const openUpwards = spaceBelow < desiredHeight && spaceAbove > spaceBelow;
        const availableSpace = openUpwards ? spaceAbove : spaceBelow;
        const calculatedMaxHeight = Math.max(140, Math.min(desiredHeight, availableSpace - 16));

        setDropdownCoords({
          x,
          y,
          width,
          height: triggerHeight,
          openUpwards,
          maxHeight: calculatedMaxHeight,
        });
        setIsCategoryOpen(true);
        chevronRotation.value = withTiming(180, { duration: 200, easing: Easing.out(Easing.cubic) });
      });
    } else {
      setIsCategoryOpen(true);
      chevronRotation.value = withTiming(180, { duration: 200, easing: Easing.out(Easing.cubic) });
    }
  };

  const closeCategoryDropdown = () => {
    setIsCategoryOpen(false);
    chevronRotation.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
  };

  const handleSelectCategory = (val: RecipeCategory) => {
    setCategory(val);
    closeCategoryDropdown();
  };

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  // Photo Upload Actions
  const handlePickFromLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        toast.warning(
          'Permission Needed',
          'Please allow access to your photos to add a recipe cover.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch {
      toast.error('Gallery Error', 'Could not open photo gallery.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        toast.warning(
          'Permission Needed',
          'Please allow camera access to take a picture of your dish.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch {
      toast.error('Camera Error', 'Could not open camera.');
    }
  };

  const handleImagePickerPress = () => {
    Alert.alert('Cover Photo', 'Choose how you want to add a picture:', [
      {
        text: 'Choose from Gallery',
        onPress: handlePickFromLibrary,
      },
      {
        text: 'Take a Picture',
        onPress: handleTakePhoto,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  // Submit Handler with Clean Validation Toasts
  const handleSubmit = () => {
    if (!title.trim() || title.trim().length < 3) {
      toast.warning('Title Required', 'Title must be at least 3 characters.');
      return;
    }

    const parsedIngredients = ingredients
      .map((item) => parseIngredientLine(item.text))
      .filter((item): item is { name: string; quantity: string } => Boolean(item && item.name));

    if (parsedIngredients.length === 0) {
      toast.warning(
        'Missing Ingredients',
        'Please enter at least one ingredient.'
      );
      return;
    }

    const validInstructions = instructions
      .map((item) => item.text.trim())
      .filter(Boolean);

    if (validInstructions.length === 0 || validInstructions.join('\n').length < 10) {
      toast.warning(
        'Instructions Needed',
        'Instructions must be at least 10 characters.'
      );
      return;
    }

    const totalPrepMinutes =
      (parseInt(prepHours, 10) || 0) * 60 + (parseInt(prepMinutes, 10) || 0);
    const totalCookMinutes =
      (parseInt(cookHours, 10) || 0) * 60 + (parseInt(cookMinutes, 10) || 0);
    const parsedServings = parseInt(servings, 10) || 1;

    createMutation.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        image: image.trim() || undefined,
        category,
        prepTime: totalPrepMinutes,
        cookTime: totalCookMinutes,
        servings: parsedServings,
        instructions: validInstructions.join('\n'),
        ingredients: parsedIngredients,
      },
      {
        onSuccess: () => {
          toast.success('Recipe Added', 'Your recipe has been saved to your collection.');
          handleBack();
        },
        onError: (err) => {
          toast.error('Save Failed', err.message || 'Please check your connection and try again.');
        },
      }
    );
  };

  // Draggable Row Renderers
  const renderIngredientItem = ({
    item,
    isActive,
    getIndex,
    DragHandle,
  }: RenderItemParams<DraggableItem>) => {
    const index = typeof getIndex === 'function' ? (getIndex() ?? 0) : 0;
    return (
      <ScaleDecorator activeScale={1.04}>
        <View
          style={[
            styles.rowContainer,
            isActive && styles.rowContainerActive,
          ]}
        >
          {/* Handle-Only Activation: 6-dot handle icon with instant drag */}
          <DragHandle
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.dragHandle}
          >
            <MaterialIcons
              name="drag-indicator"
              size={22}
              color={isActive ? '#0F172A' : '#94A3B8'}
            />
          </DragHandle>

          {/* Fully interactable and editable row TextInput */}
          <TextInput
            value={item.text}
            onChangeText={(text) => handleUpdateIngredient(item.id, text)}
            placeholder={index === 0 ? 'e.g. 2 cups all-purpose flour' : 'Ingredient'}
            placeholderTextColor="#94A3B8"
            style={styles.rowInput}
          />

          {ingredients.length > 1 && (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => handleRemoveIngredient(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.removeButton}
            >
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </ScaleDecorator>
    );
  };

  const renderInstructionItem = ({
    item,
    isActive,
    getIndex,
    DragHandle,
  }: RenderItemParams<DraggableItem>) => {
    const index = typeof getIndex === 'function' ? (getIndex() ?? 0) : 0;
    return (
      <ScaleDecorator activeScale={1.04}>
        <View
          style={[
            styles.rowContainer,
            isActive && styles.rowContainerActive,
          ]}
        >
          {/* Handle-Only Activation: 6-dot handle icon with instant drag */}
          <DragHandle
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.dragHandle}
          >
            <MaterialIcons
              name="drag-indicator"
              size={22}
              color={isActive ? '#0F172A' : '#94A3B8'}
            />
          </DragHandle>

          {/* Step Number Badge */}
          <View style={styles.stepBadge}>
            <Text style={styles.stepNumber}>
              {index + 1}
            </Text>
          </View>

          {/* Fully interactable and editable row TextInput */}
          <TextInput
            value={item.text}
            onChangeText={(text) => handleUpdateInstruction(item.id, text)}
            placeholder={index === 0 ? 'e.g. Preheat oven to 375°F (190°C)' : `Step ${index + 1}`}
            placeholderTextColor="#94A3B8"
            multiline
            style={styles.rowInputMultiline}
          />

          {instructions.length > 1 && (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => handleRemoveInstruction(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.removeButton}
            >
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </ScaleDecorator>
    );
  };

  const selectedCategoryLabel =
    CATEGORY_OPTIONS.find((c) => c.value === category)?.label || 'Dinner';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View style={[styles.root, animatedScreenStyle]}>
        <StatusBar style="dark" />

        {/* Top Navigation Header */}
        <View
          style={{ paddingTop: Math.max(insets.top, 14) }}
          className="bg-white border-b border-neutral-100 z-10"
        >
          <View className="h-14 px-5 flex-row items-center">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBack}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              className="mr-3 p-1 -ml-1"
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text
              style={{ fontFamily: fonts.bold }}
              className="text-[19px] text-neutral-900 tracking-tight"
            >
              Add a recipe
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 bg-[#F8F9FA]"
        >
          <NestableScrollContainer
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: Math.max(insets.bottom + 24, 40),
            }}
          >
            {/* Main White Card Container matching reference screenshot */}
            <View className="bg-white rounded-[24px] p-5 border border-neutral-200/60 shadow-sm mb-4">
              {/* 1. Title* */}
              <View className="mb-5">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-[15px] text-neutral-900 mb-2"
                >
                  Title*
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Title"
                  placeholderTextColor="#94A3B8"
                  style={{ fontFamily: fonts.medium }}
                  className="h-[48px] rounded-[12px] border border-neutral-200 bg-white px-4 text-[14.5px] text-neutral-900"
                />
              </View>

              {/* 2. Image Upload Box */}
              <View className="mb-5">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-[15px] text-neutral-900 mb-2"
                >
                  Image
                </Text>

                {image ? (
                  <View className="relative h-[180px] rounded-[16px] overflow-hidden border border-neutral-200">
                    <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute bottom-2.5 right-2.5 flex-row gap-2">
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleImagePickerPress}
                        className="bg-black/75 px-3 py-1.5 rounded-full flex-row items-center"
                      >
                        <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
                        <Text
                          style={{ fontFamily: fonts.semiBold }}
                          className="text-xs text-white ml-1.5"
                        >
                          Change
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setImage('')}
                        className="bg-black/75 w-8 h-8 rounded-full items-center justify-center"
                      >
                        <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={handleImagePickerPress}
                    className="h-[175px] rounded-[16px] border border-dashed border-neutral-300 bg-[#FAFAFA] items-center justify-center p-4 active:bg-neutral-100/60"
                  >
                    <Ionicons name="image-outline" size={40} color="#0F172A" />
                    <Text
                      style={{ fontFamily: fonts.bold }}
                      className="text-[15px] text-neutral-900 mt-2 mb-1"
                    >
                      Add photo
                    </Text>
                    <Text
                      style={{ fontFamily: fonts.medium }}
                      className="text-[12px] text-neutral-400"
                    >
                      PNG, JPG, JPEG, WEBP (Max 10MB)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* 3. Description */}
              <View className="mb-5">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-[15px] text-neutral-900 mb-2"
                >
                  Description
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Description"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  style={{ fontFamily: fonts.medium }}
                  className="min-h-[85px] rounded-[12px] border border-neutral-200 bg-white p-3.5 text-[14.5px] text-neutral-900 leading-snug"
                />
              </View>

              {/* 4. Ingredients (Draggable Reorderable List) */}
              <View className="mb-5">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-[15px] text-neutral-900 mb-0.5"
                >
                  Ingredients
                </Text>
                <Text
                  style={{ fontFamily: fonts.medium }}
                  className="text-[12px] text-neutral-400 mb-2.5"
                >
                  Hold handle to reorder. Tap input to edit.
                </Text>

                <NestableDraggableFlatList
                  data={ingredients}
                  onDragEnd={({ data }) => setIngredients(data)}
                  keyExtractor={(item) => item.id}
                  renderItem={renderIngredientItem}
                  scrollEnabled={false}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleAddIngredient}
                  className="flex-row items-center justify-center py-2.5 px-3 rounded-[12px] border border-dashed border-neutral-300 bg-[#FAFAFA] active:bg-neutral-100/60 mt-1"
                >
                  <Ionicons name="add" size={18} color="#0F172A" />
                  <Text
                    style={{ fontFamily: fonts.semiBold }}
                    className="text-[13.5px] text-neutral-800 ml-1.5"
                  >
                    Add ingredient
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 5. Instructions (Draggable Reorderable List) */}
              <View className="mb-5">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-[15px] text-neutral-900 mb-0.5"
                >
                  Instructions
                </Text>
                <Text
                  style={{ fontFamily: fonts.medium }}
                  className="text-[12px] text-neutral-400 mb-2.5"
                >
                  Hold handle to reorder steps. Tap input to edit.
                </Text>

                <NestableDraggableFlatList
                  data={instructions}
                  onDragEnd={({ data }) => setInstructions(data)}
                  keyExtractor={(item) => item.id}
                  renderItem={renderInstructionItem}
                  scrollEnabled={false}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleAddInstruction}
                  className="flex-row items-center justify-center py-2.5 px-3 rounded-[12px] border border-dashed border-neutral-300 bg-[#FAFAFA] active:bg-neutral-100/60 mt-1"
                >
                  <Ionicons name="add" size={18} color="#0F172A" />
                  <Text
                    style={{ fontFamily: fonts.semiBold }}
                    className="text-[13.5px] text-neutral-800 ml-1.5"
                  >
                    Add step
                  </Text>
                </TouchableOpacity>
              </View>

            {/* 6. Servings */}
            <View className="mb-5">
              <Text
                style={{ fontFamily: fonts.bold }}
                className="text-[15px] text-neutral-900 mb-2"
              >
                Servings
              </Text>
              <TextInput
                value={servings}
                onChangeText={setServings}
                placeholder="Servings"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                style={{ fontFamily: fonts.medium }}
                className="h-[48px] rounded-[12px] border border-neutral-200 bg-white px-4 text-[14.5px] text-neutral-900"
              />
            </View>

            {/* 7. Prep Time */}
            <View className="mb-5">
              <Text
                style={{ fontFamily: fonts.bold }}
                className="text-[15px] text-neutral-900 mb-2"
              >
                Prep Time
              </Text>
              <View className="flex-row gap-3">
                <TextInput
                  value={prepHours}
                  onChangeText={setPrepHours}
                  placeholder="Hours"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  style={{ fontFamily: fonts.medium }}
                  className="flex-1 h-[48px] rounded-[12px] border border-neutral-200 bg-white px-4 text-[14.5px] text-neutral-900"
                />
                <TextInput
                  value={prepMinutes}
                  onChangeText={setPrepMinutes}
                  placeholder="Minutes"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  style={{ fontFamily: fonts.medium }}
                  className="flex-1 h-[48px] rounded-[12px] border border-neutral-200 bg-white px-4 text-[14.5px] text-neutral-900"
                />
              </View>
            </View>

            {/* 8. Cook Time */}
            <View className="mb-5">
              <Text
                style={{ fontFamily: fonts.bold }}
                className="text-[15px] text-neutral-900 mb-2"
              >
                Cook Time
              </Text>
              <View className="flex-row gap-3">
                <TextInput
                  value={cookHours}
                  onChangeText={setCookHours}
                  placeholder="Hours"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  style={{ fontFamily: fonts.medium }}
                  className="flex-1 h-[48px] rounded-[12px] border border-neutral-200 bg-white px-4 text-[14.5px] text-neutral-900"
                />
                <TextInput
                  value={cookMinutes}
                  onChangeText={setCookMinutes}
                  placeholder="Minutes"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  style={{ fontFamily: fonts.medium }}
                  className="flex-1 h-[48px] rounded-[12px] border border-neutral-200 bg-white px-4 text-[14.5px] text-neutral-900"
                />
              </View>
            </View>

            {/* 9. Category Section (Animated Dropdown) */}
            <View className="mb-1">
              <Text
                style={{ fontFamily: fonts.bold }}
                className="text-[15px] text-neutral-900 mb-2"
              >
                Category
              </Text>
              <View ref={triggerRef} collapsable={false}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => {
                    if (isCategoryOpen) {
                      closeCategoryDropdown();
                    } else {
                      openCategoryDropdown();
                    }
                  }}
                  className={`w-full h-[48px] rounded-[12px] px-4 flex-row items-center justify-between border bg-white ${
                    isCategoryOpen ? 'border-neutral-800' : 'border-neutral-200'
                  }`}
                >
                  <Text
                    style={{ fontFamily: fonts.medium }}
                    className="text-[14.5px] text-neutral-900"
                  >
                    {selectedCategoryLabel}
                  </Text>
                  <Animated.View style={animatedChevronStyle}>
                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color={isCategoryOpen ? '#0F172A' : '#64748B'}
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 10. Bottom "Add Recipe" Button (Outside contents card) */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
            style={{ backgroundColor: '#32CD32' }}
            className={`w-full h-[52px] rounded-[16px] items-center justify-center flex-row shadow-sm ${
              createMutation.isPending ? 'opacity-80' : ''
            }`}
          >
            <Text
              style={{ fontFamily: fonts.bold }}
              className="text-[16px] text-[#0F2A0F]"
            >
              {createMutation.isPending ? 'Adding Recipe...' : 'Add Recipe'}
            </Text>
            {createMutation.isPending && (
              <ActivityIndicator size="small" color="#0F2A0F" style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
        </NestableScrollContainer>
      </KeyboardAvoidingView>

      {/* Floating Animated Dropdown Menu (White/Greyish Tone) */}
      <Modal
        visible={isCategoryOpen}
        transparent
        animationType="none"
        onRequestClose={closeCategoryDropdown}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeCategoryDropdown}
        />

        <Animated.View
          entering={dropdownCoords.openUpwards ? FadeInUp.duration(180) : FadeInDown.duration(180)}
          exiting={dropdownCoords.openUpwards ? FadeOutDown.duration(120) : FadeOutUp.duration(120)}
          style={[
            dropdownCoords.openUpwards
              ? {
                  position: 'absolute',
                  bottom: Math.max(windowHeight - dropdownCoords.y + 6, 16),
                  left: dropdownCoords.x,
                  width: dropdownCoords.width,
                  maxHeight: dropdownCoords.maxHeight,
                }
              : {
                  position: 'absolute',
                  top: dropdownCoords.y + dropdownCoords.height + 6,
                  left: dropdownCoords.x,
                  width: dropdownCoords.width,
                  maxHeight: dropdownCoords.maxHeight,
                },
            {
              elevation: 16,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: dropdownCoords.openUpwards ? -4 : 6 },
              shadowOpacity: 0.12,
              shadowRadius: 14,
            },
          ]}
          className="rounded-[16px] border border-neutral-200/90 bg-white overflow-hidden"
        >
          <ScrollView
            style={{ maxHeight: dropdownCoords.maxHeight }}
            showsVerticalScrollIndicator={true}
            bounces={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {CATEGORY_OPTIONS.map((item, index) => {
              const isSelected = category === item.value;
              const isLast = index === CATEGORY_OPTIONS.length - 1;

              return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={0.7}
                  onPress={() => handleSelectCategory(item.value)}
                  className={`px-4 py-3 flex-row items-center justify-between ${
                    isSelected ? 'bg-[#F1F5F9]' : 'bg-white active:bg-neutral-50'
                  } ${!isLast ? 'border-b border-neutral-100' : ''}`}
                >
                  <View className="flex-1 mr-2">
                    <Text
                      style={{
                        fontFamily: isSelected ? fonts.bold : fonts.medium,
                      }}
                      className="text-[14.5px] text-neutral-900"
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{ fontFamily: fonts.medium }}
                      className="text-[11.5px] text-neutral-400 mt-0.5"
                    >
                      {item.description}
                    </Text>
                  </View>

                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={19}
                      color="#32CD32"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      </Modal>
    </Animated.View>
  </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 8,
    minHeight: 48,
  },
  rowContainerActive: {
    borderColor: '#475569',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
  },
  dragHandle: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14.5,
    color: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  rowInputMultiline: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14.5,
    color: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 6,
    minHeight: 48,
  },
  removeButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  stepNumber: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    color: '#475569',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
