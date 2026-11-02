import React, { useState } from 'react';
import { View } from 'react-native';
import { BottomTabBar, TabKey } from '../../shared/components/bottom-tab-bar';
import { RecipesScreen } from '../../features/recipes/screens/recipes-screen';
import { CreateRecipeScreen } from '../../features/recipes/screens/create-recipe-screen';
import { RecipeDetailScreen } from '../../features/recipes/screens/recipe-detail-screen';
import { MealsScreen } from '../../features/meals/screens/meals-screen';
import { GroceryListScreen } from '../../features/groceries/screens/grocery-list-screen';
import { FavouritesScreen } from '../../features/recipes/screens/favourites-screen';
import { ProfileScreen } from '../../features/profile/screens/profile-screen';

export const TabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('recipes');
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const handleTabPress = (tab: TabKey) => {
    setIsCreatingRecipe(false);
    setSelectedRecipeId(null);
    setActiveTab(tab);
  };

  const renderActiveScreen = () => {
    if (activeTab === 'recipes') {
      if (isCreatingRecipe) {
        return <CreateRecipeScreen onBack={() => setIsCreatingRecipe(false)} />;
      }
      if (selectedRecipeId) {
        return (
          <RecipeDetailScreen
            recipeId={selectedRecipeId}
            onBack={() => setSelectedRecipeId(null)}
          />
        );
      }
      return (
        <RecipesScreen
          onNavigateToCreate={() => setIsCreatingRecipe(true)}
          onSelectRecipe={(id) => setSelectedRecipeId(id)}
        />
      );
    }

    switch (activeTab) {
      case 'meals':
        return <MealsScreen />;
      case 'groceries':
        return <GroceryListScreen />;
      case 'favourites':
        if (selectedRecipeId) {
          return (
            <RecipeDetailScreen
              recipeId={selectedRecipeId}
              onBack={() => setSelectedRecipeId(null)}
            />
          );
        }
        return <FavouritesScreen onSelectRecipe={(id) => setSelectedRecipeId(id)} />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return (
          <RecipesScreen
            onNavigateToCreate={() => setIsCreatingRecipe(true)}
            onSelectRecipe={(id) => setSelectedRecipeId(id)}
          />
        );
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1">{renderActiveScreen()}</View>
      {!isCreatingRecipe && !selectedRecipeId && (
        <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
      )}
    </View>
  );
};
