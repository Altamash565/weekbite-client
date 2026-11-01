import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentUser, useLogout } from '../../auth';
import { colors } from '../../../shared/theme/tokens';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logoutMutation.mutate(),
      },
    ]);
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Foodie';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-background px-5" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="pt-3 pb-4">
        <Text className="font-bold text-2xl text-text-primary tracking-tight">
          Profile
        </Text>
        <Text className="font-regular text-xs text-text-secondary mt-0.5">
          Your account & settings
        </Text>
      </View>

      {/* User Card */}
      <View className="bg-surface rounded-2xl border border-border p-5 mb-4">
        <View className="flex-row items-center mb-4">
          <View className="w-14 h-14 rounded-full bg-primary-tint border border-primary-dark/20 items-center justify-center mr-4">
            <Text className="font-bold text-xl text-primary-dark">{initial}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-bold text-lg text-text-primary" numberOfLines={1}>
              {displayName}
            </Text>
            <Text className="font-regular text-xs text-text-secondary mt-0.5" numberOfLines={1}>
              {user?.email || 'No email registered'}
            </Text>
          </View>
        </View>

        <View className="bg-surface-low rounded-xl p-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.primaryDark} />
            <Text className="font-medium text-xs text-text-primary ml-2">Session</Text>
          </View>
          <Text className="font-semibold text-xs text-primary-dark">Active & Encrypted</Text>
        </View>
      </View>

      {/* Quick Settings */}
      <View className="bg-surface rounded-2xl border border-border overflow-hidden mb-6">
        <View className="p-4 border-b border-border flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="nutrition-outline" size={18} color={colors.textSecondary} />
            <Text className="font-medium text-sm text-text-primary ml-3">
              Dietary Preferences
            </Text>
          </View>
          <Text className="font-regular text-xs text-text-secondary">All foods</Text>
        </View>

        <View className="p-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="server-outline" size={18} color={colors.textSecondary} />
            <Text className="font-medium text-sm text-text-primary ml-3">
              Backend Status
            </Text>
          </View>
          <Text className="font-medium text-xs text-primary-dark">Connected</Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleSignOut}
        disabled={logoutMutation.isPending}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="w-full h-[52px] rounded-xl border border-error/30 bg-surface items-center justify-center flex-row active:bg-error-tint"
      >
        <Ionicons name="log-out-outline" size={18} color={colors.error || '#D64545'} />
        <Text className="font-semibold text-sm text-error ml-2">
          {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

