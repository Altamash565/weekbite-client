import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { AuthInput } from '../components/auth-input';
import { AuthButton } from '../components/auth-button';
import { useLogin } from '../hooks/useAuth';
import { colors } from '../../../shared/theme/tokens';

const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

interface SignInScreenProps {
  onNavigateToSignUp: () => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ onNavigateToSignUp }) => {
  const insets = useSafeAreaInsets();
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: SignInFormValues) => {
    loginMutation.mutate(
      {
        email: values.email.trim(),
        password: values.password,
      },
      {
        onError: (error) => {
          Alert.alert('Sign In Failed', error.message || 'Invalid email or password');
        },
      }
    );
  };

  const isBusy = loginMutation.isPending;
  const authError = loginMutation.error ? loginMutation.error.message : null;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 28,
            paddingBottom: Math.max(insets.bottom + 16, 32),
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Logo Squircle */}
          <View className="items-center mb-8">
            <View className="w-[56px] h-[56px] rounded-3xl bg-primary-tint items-center justify-center mb-4">
              <Ionicons name="restaurant-outline" size={28} color={colors.primaryDark} />
            </View>
            <Text className="font-bold text-2xl text-text-primary tracking-tight mb-2">
              Welcome back
            </Text>
            <Text className="font-regular text-sm text-text-secondary text-center leading-5 max-w-[290px]">
              Sign in to pick up your weekly meals where you left off.
            </Text>
          </View>

          {/* Form */}
          <View className="w-full">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label="Email address"
                  placeholder="johndoe@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  importantForAutofill="yes"
                  autoCapitalize="none"
                  error={errors.email?.message}
                  editable={!isBusy}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  isPassword
                  autoComplete="current-password"
                  textContentType="password"
                  importantForAutofill="yes"
                  autoCapitalize="none"
                  error={errors.password?.message}
                  editable={!isBusy}
                />
              )}
            />

            {Boolean(authError) && (
              <Text className="font-regular text-xs text-error bg-error-tint p-3 rounded-xl mb-4 text-center">
                {authError}
              </Text>
            )}

            <AuthButton
              title="Sign in"
              variant="primary"
              onPress={() => handleSubmit(onSubmit)()}
              loading={isBusy}
              disabled={isBusy}
              className="mt-2 mb-5"
            />
          </View>

          {/* Navigation to Sign Up */}
          <View className="mt-auto items-center py-4">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onNavigateToSignUp}
              disabled={isBusy}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text className="font-regular text-sm text-text-secondary">
                Don’t have an account?{' '}
                <Text className="font-semibold text-primary-dark">Create account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
