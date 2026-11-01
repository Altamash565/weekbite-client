import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../shared/theme/tokens';

interface AuthInputProps extends TextInputProps {
  label: string;
  isPassword?: boolean;
  helperText?: string;
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  isPassword = false,
  helperText,
  error,
  className = '',
  autoCapitalize,
  autoCorrect = false,
  autoComplete,
  textContentType,
  keyboardType,
  importantForAutofill,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(!isPassword);
  const [isFocused, setIsFocused] = useState(false);

  // Compute unambiguous autofill hints so OS Autofill does not populate other fields
  let resolvedAutoComplete = autoComplete;
  let resolvedTextContentType = textContentType;
  let resolvedAutoCapitalize = autoCapitalize;
  let resolvedImportantForAutofill = importantForAutofill;

  if (!resolvedAutoComplete) {
    if (isPassword) {
      resolvedAutoComplete = 'password';
    } else if (keyboardType === 'email-address') {
      resolvedAutoComplete = 'email';
    } else if (keyboardType === 'number-pad') {
      resolvedAutoComplete = 'one-time-code';
    }
  }

  if (!resolvedTextContentType) {
    if (isPassword) {
      resolvedTextContentType = 'password';
    } else if (keyboardType === 'email-address') {
      resolvedTextContentType = 'emailAddress';
    } else if (keyboardType === 'number-pad') {
      resolvedTextContentType = 'oneTimeCode';
    }
  }

  if (resolvedAutoCapitalize === undefined) {
    resolvedAutoCapitalize = isPassword || keyboardType === 'email-address' || keyboardType === 'number-pad'
      ? 'none'
      : 'words';
  }

  // Guard against Android Autofill filling credentials into Name or Code fields
  if (!resolvedImportantForAutofill) {
    if (resolvedAutoComplete === 'name' || label.toLowerCase().includes('name')) {
      resolvedImportantForAutofill = 'no';
    } else if (resolvedAutoComplete === 'one-time-code' || keyboardType === 'number-pad') {
      resolvedImportantForAutofill = 'no';
    } else if (resolvedAutoComplete === 'email' || isPassword) {
      resolvedImportantForAutofill = 'yes';
    }
  }

  return (
    <View className="mb-5 w-full">
      <Text className="font-medium text-sm text-text-primary mb-2">
        {label}
      </Text>
      <View
        className={`flex-row items-center bg-surface h-[52px] rounded-xl border px-4 ${
          error
            ? 'border-error'
            : isFocused
            ? 'border-primary-dark'
            : 'border-border'
        }`}
      >
        <TextInput
          className={`flex-1 h-full font-regular text-[15px] text-text-primary ${className}`}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize={resolvedAutoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={resolvedAutoComplete}
          textContentType={resolvedTextContentType}
          keyboardType={keyboardType}
          importantForAutofill={resolvedImportantForAutofill}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword((prev) => !prev)}
            className="ml-2 p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {Boolean(error) ? (
        <Text className="font-regular text-xs text-error mt-1.5">{error}</Text>
      ) : Boolean(helperText) ? (
        <Text className="font-regular text-xs text-text-secondary mt-1.5">{helperText}</Text>
      ) : null}
    </View>
  );
};
