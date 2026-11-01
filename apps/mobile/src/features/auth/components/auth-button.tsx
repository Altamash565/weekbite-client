import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { colors } from '../../../shared/theme/tokens';

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      className={`h-[52px] w-full rounded-xl items-center justify-center px-5 ${
        isPrimary ? 'bg-primary' : 'bg-surface border border-border'
      } ${isDisabled ? 'opacity-50' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.primaryDark} />
      ) : (
        <Text
          className={`font-semibold text-sm tracking-wide ${
            isPrimary ? 'text-on-primary' : 'text-primary-dark'
          }`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
