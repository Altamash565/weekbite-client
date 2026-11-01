import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../shared/theme/tokens';

interface LayoutModeToggleProps {
  mode: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
}

const SLIDE_DISTANCE = 34;

export const LayoutModeToggle: React.FC<LayoutModeToggleProps> = ({
  mode,
  onChange,
}) => {
  const translateX = useSharedValue(mode === 'grid' ? 0 : SLIDE_DISTANCE);

  useEffect(() => {
    translateX.value = withSpring(mode === 'grid' ? 0 : SLIDE_DISTANCE, {
      damping: 19,
      stiffness: 240,
      mass: 0.7,
    });
  }, [mode, translateX]);

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View className="w-[74px] h-[36px] rounded-[12px] bg-surface-low border border-border flex-row items-center relative">
      {/* Sliding Floating Pill (moving offset) */}
      <Animated.View
        style={animatedThumbStyle}
        className="absolute top-[3px] left-[3px] w-[34px] h-[30px] rounded-[9px] bg-surface shadow-sm"
      />

      {/* Grid Button */}
      <Pressable
        onPress={() => onChange('grid')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 2 }}
        className="flex-1 h-full items-center justify-center z-10"
      >
        <Ionicons
          name="grid"
          size={15}
          color={mode === 'grid' ? colors.primaryDark : colors.textSecondary}
        />
      </Pressable>

      {/* List Button */}
      <Pressable
        onPress={() => onChange('list')}
        hitSlop={{ top: 8, bottom: 8, left: 2, right: 8 }}
        className="flex-1 h-full items-center justify-center z-10"
      >
        <Ionicons
          name="list"
          size={16}
          color={mode === 'list' ? colors.primaryDark : colors.textSecondary}
        />
      </Pressable>
    </View>
  );
};
