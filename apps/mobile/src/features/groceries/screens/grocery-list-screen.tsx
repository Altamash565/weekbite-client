import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../shared/theme/tokens';

interface DefaultItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
}

export const GroceryListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<DefaultItem[]>([
    { id: '1', name: 'Fresh Spinach', category: 'Produce', checked: false },
    { id: '2', name: 'Extra Virgin Olive Oil', category: 'Pantry', checked: false },
    { id: '3', name: 'Greek Yogurt', category: 'Dairy', checked: true },
    { id: '4', name: 'Garlic Cloves', category: 'Produce', checked: false },
    { id: '5', name: 'Whole Grain Pasta', category: 'Pantry', checked: false },
  ]);

  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-3 pb-3 flex-row items-center justify-between">
        <View>
          <Text className="font-bold text-2xl text-text-primary tracking-tight">
            Grocery List
          </Text>
          <Text className="font-regular text-xs text-text-secondary mt-0.5">
            {checkedCount} of {items.length} items checked
          </Text>
        </View>

        <View className="w-10 h-10 rounded-2xl bg-primary-tint items-center justify-center">
          <Ionicons name="cart" size={20} color={colors.primaryDark} />
        </View>
      </View>

      {/* Checklist */}
      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        <View className="bg-surface rounded-2xl border border-border overflow-hidden mb-4">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => toggleCheck(item.id)}
                className={`flex-row items-center justify-between p-4 ${
                  !isLast ? 'border-b border-border/70' : ''
                }`}
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View
                    className={`w-6 h-6 rounded-md items-center justify-center mr-3 border ${
                      item.checked
                        ? 'bg-primary border-primary'
                        : 'bg-background border-border'
                    }`}
                  >
                    {item.checked && (
                      <Ionicons name="checkmark" size={16} color={colors.onPrimary || '#0F2A0F'} />
                    )}
                  </View>
                  <Text
                    className={`text-sm font-medium ${
                      item.checked
                        ? 'text-text-secondary line-through'
                        : 'text-text-primary'
                    }`}
                  >
                    {item.name}
                  </Text>
                </View>

                <View className="bg-surface-low px-2 py-0.5 rounded">
                  <Text className="font-medium text-[10px] text-text-secondary">
                    {item.category}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

