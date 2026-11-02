import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fonts } from '../theme/tokens';

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
    activeIcon: 'bookmark',
    inactiveIcon: 'bookmark-outline',
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
      className="bg-white border-t border-[#EDEDED] flex-row items-center pt-1.5 px-1"
      style={{
        paddingBottom: Math.max(insets.bottom, 6),
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            className="flex-1 items-center justify-center py-0.5 min-h-[44px]"
            style={({ pressed }) => ({
              opacity: pressed ? 0.65 : 1,
              transform: [{ scale: pressed ? 0.94 : 1 }],
            })}
          >
            {tab.key === 'recipes' ? (
              <MaterialCommunityIcons
                name="chef-hat"
                size={22}
                color={isActive ? '#000000' : '#8E8E93'}
              />
            ) : (
              <Ionicons
                name={isActive ? tab.activeIcon : tab.inactiveIcon}
                size={21}
                color="#000000"
              />
            )}
            <Text
              style={{
                fontFamily: fonts.bold,
              }}
              className={`text-[10px] mt-0.5 tracking-tight font-bold ${
                isActive ? 'text-black' : 'text-neutral-400'
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
