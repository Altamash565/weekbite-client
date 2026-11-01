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
import { useRegister } from '../hooks/useAuth';
import { colors } from '../../../shared/theme/tokens';

const signUpSchema = z.object({
  fullName: z.string().min(1, 'Please enter your full name'),
  email: z
    .string()
    .min(1, 'Please enter your email address')
    .email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpScreenProps {
  onNavigateToSignIn: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigateToSignIn }) => {
  const insets = useSafeAreaInsets();
  const registerMutation = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

    const onRegister = (values: SignUpFormValues) => {
      registerMutation.mutate(
        {
          name: values.fullName.trim(),
          email: values.email.trim(),
          password: values.password,
        },
        {
          onError: (error) => {
            Alert.alert('Registration Failed', error.message || 'Could not create account');
          },
        }
      );
    };

    const isBusy = registerMutation.isPending;
    const authError = registerMutation.error ? registerMutation.error.message : null;

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
            {/* Header */}
                <View className="items-center mb-8">
                  <View className="w-[56px] h-[56px] rounded-3xl bg-primary-tint items-center justify-center mb-4">
                    <Ionicons name="restaurant-outline" size={28} color={colors.primaryDark} />
                  </View>
                  <Text className="font-bold text-2xl text-text-primary tracking-tight mb-2">
                    Create an account
                  </Text>
                  <Text className="font-regular text-sm text-text-secondary text-center leading-5 max-w-[290px]">
                    Plan your meals and take a simpler grocery list with you.
                  </Text>
                </View>

          {/* Form */}
                    <View className="w-full">
                      <Controller
                        control={control}
                        name="fullName"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <AuthInput
                            label="Full name"
                            placeholder="John Doe"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            autoComplete="name"
                            textContentType="name"
                            autoCapitalize="words"
                            importantForAutofill="no"
                            error={errors.fullName?.message}
                            editable={!isBusy}
                          />
                        )}
                      />

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
                              autoCapitalize="none"
                              importantForAutofill="yes"
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
                              placeholder="At least 6 characters"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              isPassword
                              autoComplete={Platform.select({ android: 'password-new', default: 'new-password' })}
                              textContentType="newPassword"
                              autoCapitalize="none"
                              importantForAutofill="yes"
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
                          title="Create account"
                          variant="primary"
                          onPress={() => handleSubmit(onRegister)()}
                          loading={isBusy}
                          disabled={isBusy}
                          className="mt-2 mb-5"
                        />
                      </View>

                {/* Navigation to Sign In */}
                <View className="mt-auto items-center py-4">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onNavigateToSignIn}
                    disabled={isBusy}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Text className="font-regular text-sm text-text-secondary">
                      Already have an account?{' '}
                      <Text className="font-semibold text-primary-dark">Sign in</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
          );
};
