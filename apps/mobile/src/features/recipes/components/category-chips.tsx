import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { RecipeCategory } from '../types/recipes.types';

export interface CategoryOption {
  key: string;
  label: string;
  value?: RecipeCategory;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { key: 'ALL', label: 'All' },
  { key: 'BREAKFAST', label: 'Breakfast', value: 'BREAKFAST' },
  { key: 'LUNCH', label: 'Lunch', value: 'LUNCH' },
  { key: 'DINNER', label: 'Dinner', value: 'DINNER' },
  { key: 'SNACK', label: 'Snacks', value: 'SNACK' },
  { key: 'DESSERT', label: 'Desserts', value: 'DESSERT' },
  { key: 'OTHER', label: 'Other', value: 'OTHER' },
];

interface CategoryChipsProps {
  selectedCategoryKey: string;
  onSelectCategory: (key: string, value?: RecipeCategory) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategoryKey,
  onSelectCategory,
}) => {
  return (
    <View className="mb-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {CATEGORY_OPTIONS.map((cat) => {
          const isSelected = selectedCategoryKey === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              activeOpacity={0.7}
              onPress={() => onSelectCategory(cat.key, cat.value)}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              className={`px-4 py-2 rounded-full border ${
                isSelected ? 'bg-primary border-primary' : 'bg-surface border-border'
              }`}
            >
              <Text
                className={`text-xs ${
                  isSelected
                    ? 'font-semibold text-on-primary'
                    : 'font-medium text-text-secondary'
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

