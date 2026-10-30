import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, layout, typography } from '../../../shared/theme/tokens';

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
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(!isPassword);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeButton}
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
        <Text style={styles.errorText}>{error}</Text>
      ) : Boolean(helperText) ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: typography.bodyMedium.fontSize,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    height: 52,
    borderRadius: radii.input,
    borderWidth: layout.borderWidth,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: colors.primaryDark,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeButton: {
    marginLeft: 8,
    padding: 4,
  },
  helperText: {
    fontFamily: fonts.regular,
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginTop: 6,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: typography.caption.fontSize,
    color: colors.error,
    marginTop: 6,
  },
});
