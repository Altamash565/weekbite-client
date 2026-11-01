import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../shared/theme/tokens';
import { AuthButton, useCurrentUser, useLogout } from '../features/auth';
import AuthLayout from './(auth)/_layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function AuthenticatedHomeScreen() {
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();

  const displayName = user?.name || user?.email?.split('@')[0] || 'Foodie';

  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center px-5">
      <View className="bg-surface rounded-xl border border-border p-7 w-full items-center">
        <View className="w-16 h-16 rounded-3xl bg-primary-tint items-center justify-center mb-4">
          <Ionicons name="checkmark-circle" size={36} color={colors.primaryDark} />
        </View>
        <Text className="font-bold text-xl text-text-primary mb-1.5">Welcome to WeekBite!</Text>
        <Text className="font-regular text-[15px] text-text-secondary mb-3 text-center">
          Signed in as <Text className="font-semibold text-text-primary">{displayName}</Text>
        </Text>
        {Boolean(user?.email) && (
          <Text className="font-regular text-xs text-text-secondary mb-3 text-center">
            {user?.email}
          </Text>
        )}
        <Text className="font-regular text-sm text-text-secondary text-center leading-5 mb-6">
          Your custom backend authentication is live. Cookies and session tokens are securely managed!
        </Text>
        <AuthButton
          title="Sign out"
          variant="secondary"
          onPress={() => logoutMutation.mutate()}
          loading={logoutMutation.isPending}
          disabled={logoutMutation.isPending}
          className="w-full"
        />
      </View>
    </SafeAreaView>
  );
}

function AuthGate() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="small" color={colors.primaryDark} />
      </View>
    );
  }

  if (user) {
    return <AuthenticatedHomeScreen />;
  }

  return <AuthLayout />;
}

export function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="small" color={colors.primaryDark} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View className="flex-1 bg-background">
          <AuthGate />
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default RootLayout;
