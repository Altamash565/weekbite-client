import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleIcon } from './google-icon';
import { colors } from '../../../shared/theme/tokens';

export type SocialProvider = 'google' | 'apple';

interface SocialButtonProps extends TouchableOpacityProps {
  provider: SocialProvider;
  loading?: boolean;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const isApple = provider === 'apple';
  const title = isApple ? 'Continue with Apple' : 'Continue with Google';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      className={`h-[52px] w-full rounded-xl bg-surface border border-border items-center justify-center px-4 ${
        isDisabled ? 'opacity-60' : ''
      } ${className}`}
      accessibilityRole="button"
      accessibilityLabel={title}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.primaryDark} />
      ) : (
        <View className="flex-row items-center justify-center">
          <View className="mr-3 w-5 h-5 items-center justify-center">
            {isApple ? (
              <Ionicons name="logo-apple" size={20} color={colors.textPrimary} />
            ) : (
              <GoogleIcon size={19} />
            )}
          </View>
          <Text className="text-text-primary font-medium text-sm">
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
