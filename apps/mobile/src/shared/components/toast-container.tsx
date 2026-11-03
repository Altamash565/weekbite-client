import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ToastData, useToastStore } from '../services/toast';
import { fonts } from '../theme/tokens';

export const ToastContainer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const currentToast = useToastStore((state) => state.currentToast);
  const hideToast = useToastStore((state) => state.hide);

  const [renderedToast, setRenderedToast] = React.useState<ToastData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  const dismiss = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    translateY.value = withTiming(16, {
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
          runOnJS(hideToast)();
          runOnJS(setRenderedToast)(null);
        }
      }
    );
  }, [hideToast, opacity, translateY]);

  useEffect(() => {
    if (currentToast) {
      setRenderedToast(currentToast);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Smooth slide-up & fade-in from bottom
      translateY.value = withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });

      const duration = currentToast.duration || 2500;
      timerRef.current = setTimeout(() => {
        dismiss();
      }, duration);
    } else if (renderedToast) {
      dismiss();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentToast, dismiss, opacity, renderedToast, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!renderedToast) {
    return null;
  }

  const isError = renderedToast.type === 'error';
  const isWarning = renderedToast.type === 'warning';

  const bottomOffset = Math.max(insets.bottom + 24, 40);

  return (
    <View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFill,
        {
          zIndex: 99999,
          elevation: 99999,
        },
      ]}
      className="items-center justify-end"
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            bottom: bottomOffset,
            maxWidth: '88%',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={dismiss}
          className="flex-row items-center px-4 py-2.5 rounded-full border"
          style={{
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderColor: isDark ? '#334155' : '#E2E8F0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.15 : 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          {/* Tick in a circle icon */}
          {isError ? (
            <Ionicons name="alert-circle" size={19} color="#DC2626" />
          ) : isWarning ? (
            <Ionicons name="warning" size={19} color="#D97706" />
          ) : (
            <Ionicons
              name="checkmark-circle"
              size={19}
              color={isDark ? '#22C55E' : '#16A34A'}
            />
          )}

          {/* Simple raw message */}
          <Text
            style={{
              fontFamily: fonts.semiBold,
              color: isDark ? '#F8FAFC' : '#0F172A',
            }}
            className="text-[13.5px] ml-2.5"
            numberOfLines={1}
          >
            {renderedToast.message}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
