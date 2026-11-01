import React, { useState } from 'react';
import { View } from 'react-native';
import { BottomTabBar, TabKey } from '../../shared/components/bottom-tab-bar';
import { RecipesScreen } from '../../features/recipes/screens/recipes-screen';
import { CreateRecipeScreen } from '../../features/recipes/screens/create-recipe-screen';
import { MealsScreen } from '../../features/meals/screens/meals-screen';
import { GroceryListScreen } from '../../features/groceries/screens/grocery-list-screen';
import { FavouritesScreen } from '../../features/recipes/screens/favourites-screen';
import { ProfileScreen } from '../../features/profile/screens/profile-screen';

export const TabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('recipes');
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);

  const handleTabPress = (tab: TabKey) => {
    setIsCreatingRecipe(false);
    setActiveTab(tab);
  };

  const renderActiveScreen = () => {
    if (activeTab === 'recipes') {
      if (isCreatingRecipe) {
        return <CreateRecipeScreen onBack={() => setIsCreatingRecipe(false)} />;
      }
      return <RecipesScreen onNavigateToCreate={() => setIsCreatingRecipe(true)} />;
    }

    switch (activeTab) {
      case 'meals':
        return <MealsScreen />;
      case 'groceries':
        return <GroceryListScreen />;
      case 'favourites':
        return <FavouritesScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <RecipesScreen onNavigateToCreate={() => setIsCreatingRecipe(true)} />;
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1">{renderActiveScreen()}</View>
      {!isCreatingRecipe && (
        <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
      )}
    </View>
  );
};
