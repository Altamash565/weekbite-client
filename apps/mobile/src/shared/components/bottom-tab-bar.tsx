import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

export type TabKey = 'recipes' | 'meals' | 'groceries' | 'favourites' | 'profile';

interface TabItem {
  key: TabKey;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  {
    key: 'recipes',
    label: 'Recipes',
    activeIcon: 'restaurant',
    inactiveIcon: 'restaurant-outline',
  },
  {
    key: 'meals',
    label: 'Meals',
    activeIcon: 'calendar',
    inactiveIcon: 'calendar-outline',
  },
  {
    key: 'groceries',
    label: 'Groceries',
    activeIcon: 'cart',
    inactiveIcon: 'cart-outline',
  },
  {
    key: 'favourites',
    label: 'Favourites',
    activeIcon: 'heart',
    inactiveIcon: 'heart-outline',
  },
  {
    key: 'profile',
    label: 'Profile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
];

interface BottomTabBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-surface border-t border-border flex-row justify-around items-center pt-2 px-2"
      style={{
        paddingBottom: Math.max(insets.bottom, 10),
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            className="items-center justify-center min-w-[58px] min-h-[48px]"
          >
            <View
              className={`w-9 h-7 rounded-full items-center justify-center mb-0.5 ${
                isActive ? 'bg-primary-tint' : 'bg-transparent'
              }`}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.inactiveIcon}
                size={20}
                color={isActive ? colors.primaryDark : colors.textSecondary}
              />
            </View>
            <Text
              className={`text-[10px] ${
                isActive
                  ? 'font-semibold text-primary-dark'
                  : 'font-medium text-text-secondary'
              }`}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

