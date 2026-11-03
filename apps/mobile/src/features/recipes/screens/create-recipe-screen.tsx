import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  Easing,
  FadeInDown,
  FadeOutUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useCreateRecipe } from '../hooks/useRecipes';
import { RecipeCategory } from '../types/recipes.types';
import { colors, fonts } from '../../../shared/theme/tokens';
import { toast } from '../../../shared/services/toast';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CategoryOption {
  value: RecipeCategory;
  label: string;
  description: string;
}

interface IngredientItem {
  name: string;
  quantity: string;
}

interface FormErrors {
  title?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  ingredients?: string;
  instructions?: string;
  image?: string;
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

interface CreateRecipeScreenProps {
  onBack: () => void;
}

export const CreateRecipeScreen: React.FC<CreateRecipeScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const createMutation = useCreateRecipe();

  // Entrance & Exit Transition Animation (Minimal & Real)
  const translateX = useSharedValue(36);
  const opacity = useSharedValue(0);
  const isClosingRef = useRef(false);

  useEffect(() => {
    translateX.value = withTiming(0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(1, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [opacity, translateX]);

  const handleBack = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    translateX.value = withTiming(36, {
      duration: 180,
      easing: Easing.in(Easing.cubic),
    });
    opacity.value = withTiming(
      0,
      {
        duration: 180,
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

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('DINNER');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState<{ x: number; y: number; width: number }>({
    x: 0,
    y: 0,
    width: 0,
  });

  const triggerRef = useRef<React.ElementRef<typeof View>>(null);

  // Time & Portions
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');

  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [instructions, setInstructions] = useState('');

  // Form Validation Errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Ingredients — Auto-row on typing, zero add buttons
  const [ingredients, setIngredients] = useState<IngredientItem[]>([
    { name: '', quantity: '' },
  ]);

  const handleUpdateIngredient = (
    index: number,
    field: 'name' | 'quantity',
    value: string
  ) => {
    if (errors.ingredients) {
      setErrors((prev) => ({ ...prev, ingredients: undefined }));
    }

    setIngredients((prev) => {
      const updated = prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );

      // Auto-append fresh empty row when typing in the last row
      const last = updated[updated.length - 1];
      if (last && (last.name.trim() !== '' || last.quantity.trim() !== '')) {
        return [...updated, { name: '', quantity: '' }];
      }

      return updated;
    });
  };

  const handleRemoveIngredient = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIngredients((prev) => {
      if (prev.length <= 1) {
        return [{ name: '', quantity: '' }];
      }
      const filtered = prev.filter((_, i) => i !== index);
      if (filtered.length === 0) {
        return [{ name: '', quantity: '' }];
      }
      const last = filtered[filtered.length - 1];
      if (last && (last.name.trim() !== '' || last.quantity.trim() !== '')) {
        return [...filtered, { name: '', quantity: '' }];
      }
      return filtered;
    });
  };

  const handleMoveIngredient = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= ingredients.length) return;

    // Do not swap with the last empty row
    const targetItem = ingredients[target];
    if (!targetItem || (!targetItem.name.trim() && !targetItem.quantity.trim())) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIngredients((prev) => {
      const next = [...prev];
      const temp = next[index];
      const targetVal = next[target];
      if (temp && targetVal) {
        next[index] = targetVal;
        next[target] = temp;
      }
      return next;
    });
  };

  // Reanimated Chevron Rotation
  const chevronRotation = useSharedValue(0);

  const openCategoryDropdown = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        setDropdownCoords({
          x,
          y: y + height + 6,
          width,
        });
        setIsCategoryOpen(true);
        chevronRotation.value = withTiming(180, { duration: 200 });
      });
    } else {
      setIsCategoryOpen(true);
      chevronRotation.value = withTiming(180, { duration: 200 });
    }
  };

  const closeCategoryDropdown = () => {
    setIsCategoryOpen(false);
    chevronRotation.value = withTiming(0, { duration: 200 });
  };

  const handleSelectCategory = (val: RecipeCategory) => {
    setCategory(val);
    closeCategoryDropdown();
  };

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const selectedCategoryOption =
    CATEGORY_OPTIONS.find((c) => c.value === category) || CATEGORY_OPTIONS[2];

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
        if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
      }
    } catch {
      toast.error('Error', 'Could not open photo gallery.');
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
        if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
      }
    } catch {
      toast.error('Error', 'Could not open camera.');
    }
  };

  const handleImageUploadPress = () => {
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

  // Comprehensive Form Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Please enter a recipe name.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Recipe name must be at least 3 letters.';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Recipe name cannot be longer than 100 letters.';
    }

    const parsedPrep = prepTime.trim() ? parseInt(prepTime, 10) : 0;
    if (prepTime.trim() && (isNaN(parsedPrep) || parsedPrep < 0)) {
      newErrors.prepTime = 'Must be 0 or more.';
    }

    const parsedCook = cookTime.trim() ? parseInt(cookTime, 10) : 0;
    if (cookTime.trim() && (isNaN(parsedCook) || parsedCook < 0)) {
      newErrors.cookTime = 'Must be 0 or more.';
    }

    const parsedServings = servings.trim() ? parseInt(servings, 10) : 1;
    if (servings.trim() && (isNaN(parsedServings) || parsedServings < 1)) {
      newErrors.servings = 'At least 1.';
    }

    const validIngredients = ingredients
      .map((i) => ({ name: i.name.trim(), quantity: i.quantity.trim() }))
      .filter((i) => Boolean(i.name || i.quantity));

    if (validIngredients.length === 0) {
      newErrors.ingredients = 'Please enter at least one ingredient with an amount.';
    } else {
      const incomplete = validIngredients.some((i) => !i.name || !i.quantity);
      if (incomplete) {
        newErrors.ingredients = 'Please fill both the ingredient name and amount.';
      }
    }

    if (!instructions.trim()) {
      newErrors.instructions = 'Please write the cooking steps.';
    } else if (instructions.trim().length < 10) {
      newErrors.instructions = 'Cooking steps should be at least 10 letters long.';
    }

    if (
      image.trim() &&
      !image.trim().startsWith('http://') &&
      !image.trim().startsWith('https://') &&
      !image.trim().startsWith('file://') &&
      !image.trim().startsWith('content://')
    ) {
      newErrors.image = 'Link should start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.warning('Missing Details', 'Please check the highlighted fields below.');
      return;
    }

    const parsedPrep = prepTime.trim() ? parseInt(prepTime, 10) : 0;
    const parsedCook = cookTime.trim() ? parseInt(cookTime, 10) : 0;
    const parsedServings = servings.trim() ? parseInt(servings, 10) : 1;

    const validIngredients = ingredients
      .map((i) => ({ name: i.name.trim(), quantity: i.quantity.trim() }))
      .filter((i) => Boolean(i.name && i.quantity));

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
          toast.success('Recipe Saved!', 'Your recipe has been published to your collection.');
          handleBack();
        },
        onError: (err) => {
          toast.error('Could Not Save', err.message || 'Please check your connection and try again.');
        },
      }
    );
  };

  // Count entered ingredients (ignoring trailing empty input)
  const enteredCount = ingredients.filter(
    (i) => i.name.trim() !== '' || i.quantity.trim() !== ''
  ).length;

  return (
    <Animated.View
      className="flex-1 bg-background"
      style={[{ paddingTop: insets.top }, animatedScreenStyle]}
    >
      <StatusBar style="dark" />

      {/* Screen Top Bar */}
      <View className="px-5 py-3.5 flex-row items-center border-b border-border bg-surface">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          className="mr-3 p-1 -ml-1"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text
          style={{ fontFamily: fonts.bold }}
          className="text-xl text-text-primary tracking-tight"
        >
          New Recipe
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 48) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Border Box 1: Recipe Details & Cover Photo */}
          <View className="bg-surface rounded-2xl border border-border p-4 mb-4">
            <Text
              style={{ fontFamily: fonts.semiBold }}
              className="text-[11px] text-text-secondary uppercase tracking-wider mb-2.5"
            >
              Recipe Details *
            </Text>

            {/* Title Input */}
            <TextInput
              value={title}
              onChangeText={(val) => {
                setTitle(val);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Recipe name (e.g. Garlic Chicken)"
              placeholderTextColor={colors.textSecondary}
              style={{ fontFamily: fonts.medium }}
              className={`bg-surface-low rounded-xl px-3.5 h-[46px] text-sm text-text-primary border ${
                errors.title ? 'border-error' : 'border-border/70'
              } mb-1`}
            />
            {errors.title && (
              <Text
                style={{ fontFamily: fonts.medium }}
                className="text-xs text-error mb-2.5 ml-1"
              >
                {errors.title}
              </Text>
            )}

            {/* Description Input */}
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add a short description (optional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={2}
              style={{ fontFamily: fonts.medium }}
              className="bg-surface-low rounded-xl px-3.5 py-3 text-sm text-text-primary border border-border/70 min-h-[64px] mt-2 mb-3.5"
            />

            <Text
              style={{ fontFamily: fonts.semiBold }}
              className="text-[11px] text-text-secondary uppercase tracking-wider mb-2"
            >
              Cover Photo (Optional)
            </Text>

            {image ? (
              <View className="w-full h-44 rounded-xl overflow-hidden border border-border relative bg-surface-low">
                <Image
                  source={{ uri: image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute top-2.5 right-2.5 flex-row items-center gap-2">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleImageUploadPress}
                    className="flex-row items-center bg-black/60 px-2.5 py-1.5 rounded-lg"
                  >
                    <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
                    <Text
                      style={{ fontFamily: fonts.medium }}
                      className="text-xs text-white ml-1.5"
                    >
                      Change
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setImage('')}
                    className="w-8 h-8 rounded-lg bg-black/60 items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={15} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleImageUploadPress}
                className="w-full py-5 rounded-xl border border-dashed border-border bg-surface-low items-center justify-center"
              >
                <View className="w-11 h-11 rounded-2xl bg-primary-tint items-center justify-center mb-2">
                  <Ionicons name="camera-outline" size={22} color={colors.primaryDark} />
                </View>
                <Text
                  style={{ fontFamily: fonts.semiBold }}
                  className="text-sm text-text-primary"
                >
                  Add a photo
                </Text>
                <Text
                  style={{ fontFamily: fonts.regular }}
                  className="text-[11px] text-text-secondary mt-0.5"
                >
                  Choose from gallery or take a picture
                </Text>
              </TouchableOpacity>
            )}

            {/* Optional URL Toggle */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowUrlInput((prev) => !prev)}
              className="mt-2.5 flex-row items-center justify-center py-1"
            >
              <Ionicons
                name={showUrlInput ? 'chevron-up' : 'link-outline'}
                size={13}
                color={colors.textSecondary}
              />
              <Text
                style={{ fontFamily: fonts.medium }}
                className="text-xs text-text-secondary ml-1.5"
              >
                {showUrlInput ? 'Hide image link' : 'Or paste an image web link'}
              </Text>
            </TouchableOpacity>

            {/* URL Input */}
            {showUrlInput && (
              <View className="mt-2">
                <TextInput
                  value={image}
                  onChangeText={(val) => {
                    setImage(val);
                    if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
                  }}
                  placeholder="Paste an image link (e.g. https://...)"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="url"
                  style={{ fontFamily: fonts.medium }}
                  className={`bg-surface-low rounded-xl px-3.5 h-[46px] text-sm text-text-primary border ${
                    errors.image ? 'border-error' : 'border-border/70'
                  }`}
                />
                {errors.image && (
                  <Text
                    style={{ fontFamily: fonts.medium }}
                    className="text-xs text-error mt-1 ml-1"
                  >
                    {errors.image}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Border Box 2: Category Selector */}
          <View className="bg-surface rounded-2xl border border-border p-4 mb-4">
            <Text
              style={{ fontFamily: fonts.semiBold }}
              className="text-[11px] text-text-secondary uppercase tracking-wider mb-2.5"
            >
              Category *
            </Text>

            {/* Dropdown Trigger Field */}
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
                className={`w-full h-[46px] rounded-xl px-3.5 flex-row items-center justify-between border ${
                  isCategoryOpen
                    ? 'border-primary bg-surface'
                    : 'border-border/70 bg-surface-low'
                }`}
              >
                <Text
                  style={{ fontFamily: fonts.medium }}
                  className="text-sm text-text-primary"
                >
                  {selectedCategoryOption.label}
                </Text>

                <Animated.View style={animatedChevronStyle}>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={isCategoryOpen ? colors.primaryDark : colors.textSecondary}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Border Box 3: Time & Portions */}
          <View className="bg-surface rounded-2xl border border-border p-4 mb-4">
            <Text
              style={{ fontFamily: fonts.semiBold }}
              className="text-[11px] text-text-secondary uppercase tracking-wider mb-2.5"
            >
              Cooking Time & Servings *
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text
                  style={{ fontFamily: fonts.medium }}
                  className="text-[11px] text-text-secondary mb-1"
                >
                  Prep time (mins)
                </Text>
                <TextInput
                  value={prepTime}
                  onChangeText={(val) => {
                    setPrepTime(val);
                    if (errors.prepTime) setErrors((prev) => ({ ...prev, prepTime: undefined }));
                  }}
                  placeholder="15"
                  placeholderTextColor={colors.textSecondary + '70'}
                  keyboardType="numeric"
                  style={{ fontFamily: fonts.medium }}
                  className={`bg-surface-low rounded-xl border px-3 h-[46px] text-sm text-text-primary text-center ${
                    errors.prepTime ? 'border-error' : 'border-border/70'
                  }`}
                />
                {errors.prepTime && (
                  <Text
                    style={{ fontFamily: fonts.medium }}
                    className="text-[10px] text-error mt-1 text-center"
                  >
                    {errors.prepTime}
                  </Text>
                )}
              </View>

              <View className="flex-1">
                <Text
                  style={{ fontFamily: fonts.medium }}
                  className="text-[11px] text-text-secondary mb-1"
                >
                  Cook time (mins)
                </Text>
                <TextInput
                  value={cookTime}
                  onChangeText={(val) => {
                    setCookTime(val);
                    if (errors.cookTime) setErrors((prev) => ({ ...prev, cookTime: undefined }));
                  }}
                  placeholder="25"
                  placeholderTextColor={colors.textSecondary + '70'}
                  keyboardType="numeric"
                  style={{ fontFamily: fonts.medium }}
                  className={`bg-surface-low rounded-xl border px-3 h-[46px] text-sm text-text-primary text-center ${
                    errors.cookTime ? 'border-error' : 'border-border/70'
                  }`}
                />
                {errors.cookTime && (
                  <Text
                    style={{ fontFamily: fonts.medium }}
                    className="text-[10px] text-error mt-1 text-center"
                  >
                    {errors.cookTime}
                  </Text>
                )}
              </View>

              <View className="flex-1">
                <Text
                  style={{ fontFamily: fonts.medium }}
                  className="text-[11px] text-text-secondary mb-1"
                >
                  Servings
                </Text>
                <TextInput
                  value={servings}
                  onChangeText={(val) => {
                    setServings(val);
                    if (errors.servings) setErrors((prev) => ({ ...prev, servings: undefined }));
                  }}
                  placeholder="2"
                  placeholderTextColor={colors.textSecondary + '70'}
                  keyboardType="numeric"
                  style={{ fontFamily: fonts.medium }}
                  className={`bg-surface-low rounded-xl border px-3 h-[46px] text-sm text-text-primary text-center ${
                    errors.servings ? 'border-error' : 'border-border/70'
                  }`}
                />
                {errors.servings && (
                  <Text
                    style={{ fontFamily: fonts.medium }}
                    className="text-[10px] text-error mt-1 text-center"
                  >
                    {errors.servings}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Border Box 4: Ingredients */}
          <View className="bg-surface rounded-2xl border border-border p-4 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Text
                  style={{ fontFamily: fonts.semiBold }}
                  className="text-[11px] text-text-secondary uppercase tracking-wider"
                >
                  Ingredients *
                </Text>
                {enteredCount > 1 && (
                  <Text
                    style={{ fontFamily: fonts.regular }}
                    className="text-[10px] text-text-secondary/70 ml-2"
                  >
                    (Use ↑ / ↓ to arrange)
                  </Text>
                )}
              </View>
            </View>

            {errors.ingredients && (
              <Text
                style={{ fontFamily: fonts.medium }}
                className="text-xs text-error mb-2.5 ml-0.5"
              >
                {errors.ingredients}
              </Text>
            )}

            {/* Ingredients List */}
            {ingredients.map((ing, idx) => {
              const hasContent = Boolean(ing.name.trim() || ing.quantity.trim());
              const isLastEmpty = idx === ingredients.length - 1 && !hasContent;
              const canMoveUp = idx > 0 && hasContent;
              const canMoveDown = idx < enteredCount - 1 && hasContent;

              return (
                <View
                  key={idx}
                  className="flex-row items-center mb-2.5"
                >
                  {/* Arrange Up / Down Controls */}
                  {enteredCount > 1 && !isLastEmpty ? (
                    <View className="flex-col mr-1.5 items-center justify-center w-5">
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => handleMoveIngredient(idx, 'up')}
                        disabled={!canMoveUp}
                        hitSlop={{ top: 6, bottom: 4, left: 6, right: 6 }}
                        className={`p-0.5 ${!canMoveUp ? 'opacity-20' : 'opacity-80'}`}
                      >
                        <Ionicons name="chevron-up" size={15} color={colors.textPrimary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => handleMoveIngredient(idx, 'down')}
                        disabled={!canMoveDown}
                        hitSlop={{ top: 4, bottom: 6, left: 6, right: 6 }}
                        className={`p-0.5 ${!canMoveDown ? 'opacity-20' : 'opacity-80'}`}
                      >
                        <Ionicons name="chevron-down" size={15} color={colors.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {/* Ingredient Name Input */}
                  <TextInput
                    value={ing.name}
                    onChangeText={(val) => handleUpdateIngredient(idx, 'name', val)}
                    placeholder="Ingredient (e.g. Chicken)"
                    placeholderTextColor={colors.textSecondary}
                    style={{ fontFamily: fonts.medium }}
                    className="flex-1 bg-surface-low rounded-xl border border-border/70 px-3.5 h-[46px] text-sm text-text-primary mr-2"
                  />

                  {/* Quantity Input */}
                  <TextInput
                    value={ing.quantity}
                    onChangeText={(val) => handleUpdateIngredient(idx, 'quantity', val)}
                    placeholder="Amount (e.g. 2 cups)"
                    placeholderTextColor={colors.textSecondary}
                    style={{ fontFamily: fonts.medium }}
                    className="w-28 bg-surface-low rounded-xl border border-border/70 px-3.5 h-[46px] text-sm text-text-primary"
                  />

                  {/* Delete Icon */}
                  {!isLastEmpty && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleRemoveIngredient(idx)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      className="w-9 h-[46px] items-center justify-center ml-1"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={17}
                        color={colors.error || '#D64545'}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* Border Box 5: Instructions */}
          <View className="bg-surface rounded-2xl border border-border p-4 mb-6">
            <Text
              style={{ fontFamily: fonts.semiBold }}
              className="text-[11px] text-text-secondary uppercase tracking-wider mb-2"
            >
              Instructions *
            </Text>

            <TextInput
              value={instructions}
              onChangeText={(val) => {
                setInstructions(val);
                if (errors.instructions) {
                  setErrors((prev) => ({ ...prev, instructions: undefined }));
                }
              }}
              placeholder="Write the cooking steps here..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={{ fontFamily: fonts.medium }}
              className={`bg-surface-low rounded-xl border p-3.5 text-sm text-text-primary min-h-[130px] leading-5 ${
                errors.instructions ? 'border-error' : 'border-border/70'
              }`}
            />
            {errors.instructions && (
              <Text
                style={{ fontFamily: fonts.medium }}
                className="text-xs text-error mt-1 ml-1"
              >
                {errors.instructions}
              </Text>
            )}
          </View>

          {/* Bottom Primary Action Button: "Save Recipe" */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
            className={`w-full h-[52px] rounded-xl bg-primary items-center justify-center flex-row shadow-sm ${
              createMutation.isPending ? 'opacity-85' : ''
            }`}
          >
            <Text
              style={{ fontFamily: fonts.bold }}
              className="text-sm text-on-primary"
            >
              {createMutation.isPending ? 'Saving Recipe...' : 'Save Recipe'}
            </Text>
            {createMutation.isPending && (
              <ActivityIndicator
                size="small"
                color={colors.onPrimary || '#0F2A0F'}
                style={{ marginLeft: 8 }}
              />
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Overlapping Dropdown Menu */}
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
          entering={FadeInDown.duration(180)}
          exiting={FadeOutUp.duration(120)}
          style={{
            position: 'absolute',
            top: dropdownCoords.y,
            left: dropdownCoords.x,
            width: dropdownCoords.width,
            maxHeight: 220,
            elevation: 16,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.16,
            shadowRadius: 14,
          }}
          className="rounded-xl border border-border bg-surface overflow-hidden"
        >
          <ScrollView
            style={{ maxHeight: 220 }}
            showsVerticalScrollIndicator={true}
            bounces={true}
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
                    isSelected ? 'bg-primary-tint/60' : 'bg-surface'
                  } ${!isLast ? 'border-b border-border/40' : ''}`}
                >
                  <View className="flex-1 mr-2">
                    <Text
                      style={{
                        fontFamily: isSelected ? fonts.semiBold : fonts.medium,
                      }}
                      className={`text-sm ${
                        isSelected ? 'text-primary-dark' : 'text-text-primary'
                      }`}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{ fontFamily: fonts.regular }}
                      className="text-[11px] text-text-secondary mt-0.5"
                    >
                      {item.description}
                    </Text>
                  </View>

                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={colors.primaryDark}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      </Modal>
    </Animated.View>
  );
};
