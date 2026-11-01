import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../shared/theme/tokens';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MealsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-3 pb-3">
        <Text className="font-bold text-2xl text-text-primary tracking-tight">
          Weekly Meals
        </Text>
        <Text className="font-regular text-xs text-text-secondary mt-0.5">
          Plan your week with calm consistency
        </Text>
      </View>

      {/* Simple Days Row */}
      <View className="px-5 mb-4">
        <View className="flex-row justify-between bg-surface rounded-xl border border-border p-1.5">
          {DAYS.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDayIndex(idx)}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                className={`flex-1 py-2 rounded-lg items-center ${
                  isSelected ? 'bg-primary' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-xs ${
                    isSelected ? 'font-bold text-on-primary' : 'font-medium text-text-secondary'
                  }`}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Meals Slots */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((slot) => (
          <View key={slot} className="bg-surface rounded-xl border border-border p-4 mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-semibold text-sm text-text-primary">{slot}</Text>
              <Text className="font-regular text-xs text-text-secondary">Not planned</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              className="py-2.5 rounded-lg border border-dashed border-border items-center justify-center flex-row"
            >
              <Ionicons name="add-circle-outline" size={16} color={colors.primaryDark} />
              <Text className="font-semibold text-xs text-primary-dark ml-1.5">
                Add {slot}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

