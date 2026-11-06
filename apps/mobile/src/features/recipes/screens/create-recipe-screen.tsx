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
import { createRecipeSchema, RecipeCategory } from '../types/recipes.types';
import { fonts } from '../../../shared/theme/tokens';
import { toast } from '../../../shared/services/toast';

interface InputErrorMessageProps {
  message?: string;
  visible?: boolean;
}

const InputErrorMessage: React.FC<InputErrorMessageProps> = ({
  message,
  visible = true,
}) => {
  if (!visible || !message) return null;
  return (
    <View style={styles.errorRow}>
      <Ionicons name="alert-circle" size={14} color="#DC2626" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

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
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const prepHoursInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const prepMinutesInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const cookHoursInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const cookMinutesInputRef = useRef<React.ElementRef<typeof TextInput>>(null);

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

  // Form Fields State matching reference design & backend DTO
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

  // Touched state to reveal errors after interaction or submission attempt
  const [touched, setTouched] = useState<{
    title?: boolean;
    description?: boolean;
    servings?: boolean;
    prepHours?: boolean;
    prepMinutes?: boolean;
    cookHours?: boolean;
    cookMinutes?: boolean;
    ingredients?: Record<string, boolean>;
    instructions?: Record<string, boolean>;
  }>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const markTouched = (
    field:
      | 'title'
      | 'description'
      | 'servings'
      | 'prepHours'
      | 'prepMinutes'
      | 'cookHours'
      | 'cookMinutes'
  ) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const markIngredientTouched = (id: string) => {
    setTouched((prev) => ({
      ...prev,
      ingredients: { ...prev.ingredients, [id]: true },
    }));
  };

  const markInstructionTouched = (id: string) => {
    setTouched((prev) => ({
      ...prev,
      instructions: { ...prev.instructions, [id]: true },
    }));
  };

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

  // -------------------------------------------------------------
  // Dynamic Real-Time Form Validation (Rules based on Postman & Zod)
  // -------------------------------------------------------------

  // 1. Title: required, min 3, max 100
  const trimmedTitle = title.trim();
  let titleError: string | undefined;
  if (!trimmedTitle) {
    titleError = 'Title is required (minimum 3 characters)';
  } else if (trimmedTitle.length < 3) {
    titleError = 'Title must be at least 3 characters long';
  } else if (trimmedTitle.length > 100) {
    titleError = 'Title cannot exceed 100 characters';
  }

  // 2. Description: optional, max 500
  let descriptionError: string | undefined;
  if (description.trim().length > 500) {
    descriptionError = 'Description cannot exceed 500 characters';
  }

  // 3. Servings: required integer >= 1
  const trimmedServings = servings.trim();
  let servingsError: string | undefined;
  if (!trimmedServings) {
    servingsError = 'Servings is required (e.g. 2 or 4)';
  } else if (!/^\d+$/.test(trimmedServings)) {
    servingsError = 'Servings must be a positive whole number';
  } else {
    const numServings = parseInt(trimmedServings, 10);
    if (numServings < 1) {
      servingsError = 'Servings must be at least 1';
    } else if (numServings > 1000) {
      servingsError = 'Servings cannot exceed 1,000';
    }
  }

  // 4. Prep Time: non-negative integer, minutes 0-59
  const trimmedPrepHours = prepHours.trim();
  const trimmedPrepMins = prepMinutes.trim();
  let prepTimeError: string | undefined;
  let prepHoursHasError = false;
  let prepMinutesHasError = false;

  if (trimmedPrepHours && !/^\d+$/.test(trimmedPrepHours)) {
    prepTimeError = 'Prep hours must be a whole number';
    prepHoursHasError = true;
  } else if (trimmedPrepMins && !/^\d+$/.test(trimmedPrepMins)) {
    prepTimeError = 'Prep minutes must be a whole number';
    prepMinutesHasError = true;
  } else if (trimmedPrepMins && parseInt(trimmedPrepMins, 10) > 1440) {
    prepTimeError = 'Prep minutes cannot exceed 1,440 (24h)';
    prepMinutesHasError = true;
  }

  // 5. Cook Time: non-negative integers
  const trimmedCookHours = cookHours.trim();
  const trimmedCookMins = cookMinutes.trim();
  let cookTimeError: string | undefined;
  let cookHoursHasError = false;
  let cookMinutesHasError = false;

  if (trimmedCookHours && !/^\d+$/.test(trimmedCookHours)) {
    cookTimeError = 'Cook hours must be a whole number';
    cookHoursHasError = true;
  } else if (trimmedCookMins && !/^\d+$/.test(trimmedCookMins)) {
    cookTimeError = 'Cook minutes must be a whole number';
    cookMinutesHasError = true;
  } else if (trimmedCookMins && parseInt(trimmedCookMins, 10) > 1440) {
    cookTimeError = 'Cook minutes cannot exceed 1,440 (24h)';
    cookMinutesHasError = true;
  }

  // 6. Ingredients: at least 1 non-empty, and flag empty rows
  const parsedIngredients = ingredients
    .map((item) => ({ item, parsed: parseIngredientLine(item.text) }))
    .filter((entry): entry is { item: DraggableItem; parsed: { name: string; quantity: string } } =>
      Boolean(entry.parsed && entry.parsed.name)
    );

  const emptyIngredientIds = new Set(
    ingredients
      .filter((item) => !item.text.trim())
      .map((item) => item.id)
  );

  let ingredientsError: string | undefined;
  if (parsedIngredients.length === 0) {
    ingredientsError = 'At least one ingredient with a quantity is required (e.g. "2 cups flour")';
  } else if (emptyIngredientIds.size > 0 && ingredients.length > 1) {
    ingredientsError = 'Please fill in or remove empty ingredient rows';
  }

  // 7. Instructions: at least 1 non-empty, combined length >= 10, flag empty steps
  const validInstructions = instructions
    .map((item) => item.text.trim())
    .filter(Boolean);

  const emptyInstructionIds = new Set(
    instructions
      .filter((item) => !item.text.trim())
      .map((item) => item.id)
  );

  const combinedInstructions = validInstructions.join('\n');
  let instructionsError: string | undefined;
  if (validInstructions.length === 0) {
    instructionsError = 'At least one instruction step is required';
  } else if (combinedInstructions.length < 10) {
    instructionsError = `Instructions must be at least 10 characters long (${combinedInstructions.length}/10)`;
  } else if (emptyInstructionIds.size > 0 && instructions.length > 1) {
    instructionsError = 'Please fill in or remove empty step rows';
  }

  // Determine which field errors should be visible based on blur or submit attempt
  const showTitleError = (hasAttemptedSubmit || touched.title) && Boolean(titleError);
  const showDescriptionError =
    (hasAttemptedSubmit || touched.description) && Boolean(descriptionError);
  const showServingsError =
    (hasAttemptedSubmit || touched.servings) && Boolean(servingsError);
  const showPrepTimeError =
    (hasAttemptedSubmit || touched.prepHours || touched.prepMinutes) &&
    Boolean(prepTimeError);
  const showCookTimeError =
    (hasAttemptedSubmit || touched.cookHours || touched.cookMinutes) &&
    Boolean(cookTimeError);
  const showIngredientsError =
    (hasAttemptedSubmit || Object.keys(touched.ingredients || {}).length > 0) &&
    Boolean(ingredientsError);
  const showInstructionsError =
    (hasAttemptedSubmit || Object.keys(touched.instructions || {}).length > 0) &&
    Boolean(instructionsError);

  const hasAnyFormError = Boolean(
    titleError ||
      descriptionError ||
      servingsError ||
      prepTimeError ||
      cookTimeError ||
      ingredientsError ||
      instructionsError
  );

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
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const formattedUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setImage(formattedUri);
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
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const formattedUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setImage(formattedUri);
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

  // Submit Handler with Comprehensive Validation & Zod Schema Enforcement
  const handleSubmit = () => {
    Keyboard.dismiss();
    setHasAttemptedSubmit(true);

    if (hasAnyFormError) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      toast.warning(
        'Check Recipe Details',
        'Please correct the highlighted errors before saving your recipe.'
      );
      return;
    }

    const totalPrepMinutes =
      (parseInt(prepHours, 10) || 0) * 60 + (parseInt(prepMinutes, 10) || 0);
    const totalCookMinutes =
      (parseInt(cookHours, 10) || 0) * 60 + (parseInt(cookMinutes, 10) || 0);
    const parsedServings = parseInt(servings, 10) || 1;

    const payload = {
      title: trimmedTitle,
      description: description.trim() || undefined,
      image: image.trim() || undefined,
      category,
      prepTime: totalPrepMinutes,
      cookTime: totalCookMinutes,
      servings: parsedServings,
      instructions: combinedInstructions,
      ingredients: parsedIngredients.map((p) => p.parsed),
    };

    // Strict validation against Zod schema matching Postman collection
    const parseResult = createRecipeSchema.safeParse(payload);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      toast.error('Validation Error', issue?.message || 'Invalid form data.');
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Recipe Added', 'Your recipe has been saved to your collection.');
        handleBack();
      },
      onError: (err) => {
        toast.error('Save Failed', err.message || 'Please check your connection and try again.');
      },
    });
  };

  // Draggable Row Renderers
  const renderIngredientItem = ({
    item,
    isActive,
    getIndex,
    DragHandle,
  }: RenderItemParams<DraggableItem>) => {
    const index = typeof getIndex === 'function' ? (getIndex() ?? 0) : 0;
    const isRowEmpty = !item.text.trim();
    const isRowTouched = hasAttemptedSubmit || Boolean(touched.ingredients?.[item.id]);
    const showRowError = isRowTouched && isRowEmpty;

    return (
      <ScaleDecorator activeScale={1.04}>
        <View
          style={[
            styles.rowContainer,
            isActive && styles.rowContainerActive,
            showRowError && styles.rowContainerError,
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
              color={isActive ? '#0F172A' : showRowError ? '#EF4444' : '#94A3B8'}
            />
          </DragHandle>

          {/* Fully interactable and editable row TextInput */}
          <TextInput
            value={item.text}
            onChangeText={(text) => handleUpdateIngredient(item.id, text)}
            onBlur={() => markIngredientTouched(item.id)}
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
              <Ionicons name="close" size={18} color={showRowError ? '#EF4444' : '#94A3B8'} />
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
    const isStepEmpty = !item.text.trim();
    const isStepTouched = hasAttemptedSubmit || Boolean(touched.instructions?.[item.id]);
    const showStepError = isStepTouched && isStepEmpty;

    return (
      <ScaleDecorator activeScale={1.04}>
        <View
          style={[
            styles.rowContainer,
            isActive && styles.rowContainerActive,
            showStepError && styles.rowContainerError,
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
              color={isActive ? '#0F172A' : showStepError ? '#EF4444' : '#94A3B8'}
            />
          </DragHandle>

          {/* Step Number Badge */}
          <View style={[styles.stepBadge, showStepError && styles.stepBadgeError]}>
            <Text style={[styles.stepNumber, showStepError && styles.stepNumberError]}>
              {index + 1}
            </Text>
          </View>

          {/* Fully interactable and editable row TextInput */}
          <TextInput
            value={item.text}
            onChangeText={(text) => handleUpdateInstruction(item.id, text)}
            onBlur={() => markInstructionTouched(item.id)}
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
              <Ionicons name="close" size={18} color={showStepError ? '#EF4444' : '#94A3B8'} />
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
          enabled={Platform.OS === 'ios'}
          className="flex-1 bg-[#F8F9FA]"
        >
          <NestableScrollContainer
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: Math.max(insets.bottom + 16, 28),
            }}
          >
            {/* Main White Card Container matching reference screenshot */}
            <View className="bg-white rounded-[24px] p-5 border border-neutral-200/60 shadow-sm mb-4">
              {/* Optional Error Summary Banner on Submit Attempt */}
              {hasAttemptedSubmit && hasAnyFormError && (
                <View style={styles.errorSummaryBanner}>
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text style={styles.errorSummaryText}>
                    Please resolve the highlighted fields below before adding.
                  </Text>
                </View>
              )}

              {/* 1. Title* */}
              <View className="mb-5">
                <View className="flex-row justify-between items-center mb-2">
                  <Text
                    style={{ fontFamily: fonts.bold }}
                    className="text-[15px] text-neutral-900"
                  >
                    Title*
                  </Text>
                  <Text
                    style={{ fontFamily: fonts.medium }}
                    className={`text-[12px] ${
                      trimmedTitle.length > 100
                        ? 'text-red-600 font-bold'
                        : 'text-neutral-400'
                    }`}
                  >
                    {trimmedTitle.length}/100
                  </Text>
                </View>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  onBlur={() => markTouched('title')}
                  placeholder="Title (e.g. Garlic Butter Pasta)"
                  placeholderTextColor="#94A3B8"
                  maxLength={120}
                  style={[
                    styles.inputField,
                    showTitleError && styles.inputFieldError,
                  ]}
                />
                <InputErrorMessage message={titleError} visible={showTitleError} />
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
                <View className="flex-row justify-between items-center mb-2">
                  <Text
                    style={{ fontFamily: fonts.bold }}
                    className="text-[15px] text-neutral-900"
                  >
                    Description
                  </Text>
                  <Text
                    style={{ fontFamily: fonts.medium }}
                    className={`text-[12px] ${
                      description.length > 500
                        ? 'text-red-600 font-bold'
                        : 'text-neutral-400'
                    }`}
                  >
                    {description.length}/500
                  </Text>
                </View>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  onBlur={() => markTouched('description')}
                  placeholder="Short overview, flavour notes, or tips"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={600}
                  style={[
                    styles.descriptionInput,
                    showDescriptionError && styles.inputFieldError,
                  ]}
                />
                <InputErrorMessage
                  message={descriptionError}
                  visible={showDescriptionError}
                />
              </View>

              {/* 4. Ingredients (Draggable Reorderable List) */}
              <View className="mb-5">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-[15px] text-neutral-900 mb-0.5"
                >
                  Ingredients*
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

                <InputErrorMessage
                  message={ingredientsError}
                  visible={showIngredientsError}
                />
              </View>

              {/* 5. Instructions (Draggable Reorderable List) */}
              <View className="mb-5">
                <View className="flex-row justify-between items-center mb-0.5">
                  <Text
                    style={{ fontFamily: fonts.bold }}
                    className="text-[15px] text-neutral-900"
                  >
                    Instructions*
                  </Text>
                  <Text
                    style={{ fontFamily: fonts.medium }}
                    className={`text-[12px] ${
                      combinedInstructions.length < 10 &&
                      (hasAttemptedSubmit ||
                        Object.keys(touched.instructions || {}).length > 0)
                        ? 'text-red-600 font-bold'
                        : 'text-neutral-400'
                    }`}
                  >
                    {combinedInstructions.length} chars (min 10)
                  </Text>
                </View>
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

                <InputErrorMessage
                  message={instructionsError}
                  visible={showInstructionsError}
                />
              </View>

              {/* 6. Servings */}
              <View className="mb-5">
                <Text
                  style={{ fontFamily: fonts.bold }}
                  className="text-[15px] text-neutral-900 mb-2"
                >
                  Servings*
                </Text>
                <TextInput
                  value={servings}
                  onChangeText={(val) => {
                    const digitsOnly = val.replace(/[^0-9]/g, '');
                    setServings(digitsOnly);
                  }}
                  onBlur={() => markTouched('servings')}
                  placeholder="e.g. 2 or 4"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={3}
                  returnKeyType="next"
                  onSubmitEditing={() => prepHoursInputRef.current?.focus()}
                  style={[
                    styles.inputField,
                    showServingsError && styles.inputFieldError,
                  ]}
                />
                <InputErrorMessage
                  message={servingsError}
                  visible={showServingsError}
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
                  <View className="flex-1">
                    <TextInput
                      ref={prepHoursInputRef}
                      value={prepHours}
                      onChangeText={(val) => {
                        const digitsOnly = val.replace(/[^0-9]/g, '');
                        setPrepHours(digitsOnly);
                      }}
                      onBlur={() => markTouched('prepHours')}
                      placeholder="Hours"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={3}
                      returnKeyType="next"
                      onSubmitEditing={() => prepMinutesInputRef.current?.focus()}
                      style={[
                        styles.inputField,
                        prepHoursHasError &&
                          (hasAttemptedSubmit || touched.prepHours) &&
                          styles.inputFieldError,
                      ]}
                    />
                  </View>
                  <View className="flex-1">
                    <TextInput
                      ref={prepMinutesInputRef}
                      value={prepMinutes}
                      onChangeText={(val) => {
                        const digitsOnly = val.replace(/[^0-9]/g, '');
                        setPrepMinutes(digitsOnly);
                      }}
                      onBlur={() => markTouched('prepMinutes')}
                      placeholder="Minutes"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={3}
                      returnKeyType="next"
                      onSubmitEditing={() => cookHoursInputRef.current?.focus()}
                      style={[
                        styles.inputField,
                        prepMinutesHasError &&
                          (hasAttemptedSubmit || touched.prepMinutes) &&
                          styles.inputFieldError,
                      ]}
                    />
                  </View>
                </View>
                <InputErrorMessage
                  message={prepTimeError}
                  visible={showPrepTimeError}
                />
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
                  <View className="flex-1">
                    <TextInput
                      ref={cookHoursInputRef}
                      value={cookHours}
                      onChangeText={(val) => {
                        const digitsOnly = val.replace(/[^0-9]/g, '');
                        setCookHours(digitsOnly);
                      }}
                      onBlur={() => markTouched('cookHours')}
                      placeholder="Hours"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={3}
                      returnKeyType="next"
                      onSubmitEditing={() => cookMinutesInputRef.current?.focus()}
                      style={[
                        styles.inputField,
                        cookHoursHasError &&
                          (hasAttemptedSubmit || touched.cookHours) &&
                          styles.inputFieldError,
                      ]}
                    />
                  </View>
                  <View className="flex-1">
                    <TextInput
                      ref={cookMinutesInputRef}
                      value={cookMinutes}
                      onChangeText={(val) => {
                        const digitsOnly = val.replace(/[^0-9]/g, '');
                        setCookMinutes(digitsOnly);
                      }}
                      onBlur={() => markTouched('cookMinutes')}
                      placeholder="Minutes"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={3}
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                      style={[
                        styles.inputField,
                        cookMinutesHasError &&
                          (hasAttemptedSubmit || touched.cookMinutes) &&
                          styles.inputFieldError,
                      ]}
                    />
                  </View>
                </View>
                <InputErrorMessage
                  message={cookTimeError}
                  visible={showCookTimeError}
                />
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
  stepBadgeError: {
    backgroundColor: '#FEE2E2',
  },
  stepNumberError: {
    color: '#DC2626',
  },
  inputField: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 14.5,
    fontFamily: fonts.medium,
    color: '#0F172A',
  },
  descriptionInput: {
    minHeight: 85,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 14,
    fontSize: 14.5,
    fontFamily: fonts.medium,
    color: '#0F172A',
    lineHeight: 20,
  },
  inputFieldError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  rowContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#DC2626',
    marginLeft: 5,
    flexShrink: 1,
  },
  errorSummaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorSummaryText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#B91C1C',
    marginLeft: 8,
    flexShrink: 1,
  },
});
