
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ImportScreen from './components/ImportScreen';
import RecipeDetailScreen from './components/RecipeDetailScreen';
import { AppScreen, Recipe } from './types';
import { extractRecipeFromUrl } from './services/geminiService';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>('import');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recent_recipes');
    if (saved) {
      setRecentRecipes(JSON.parse(saved));
    }
  }, []);

  const saveRecipe = (recipe: Recipe) => {
    const updated = [recipe, ...recentRecipes.filter(r => r.videoUrl !== recipe.videoUrl)].slice(0, 10);
    setRecentRecipes(updated);
    localStorage.setItem('recent_recipes', JSON.stringify(updated));
  };

  const handleUpdateRecipe = (updatedRecipe: Recipe) => {
    setSelectedRecipe(updatedRecipe);
    saveRecipe(updatedRecipe);
  };

  const handleExtract = async (url: string) => {
    if (!url) return;
    setIsLoading(true);
    try {
      const recipe = await extractRecipeFromUrl(url);
      setSelectedRecipe(recipe);
      saveRecipe(recipe);
      setActiveScreen('recipe-detail');
    } catch (error: any) {
      console.error("Extraction failed:", error);
      const message = error instanceof Error ? error.message : "Failed to extract recipe. Please check the URL and try again.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setActiveScreen('recipe-detail');
  };

  const handleBack = () => {
    if (activeScreen === 'recipe-detail') {
      setActiveScreen('import');
      setSelectedRecipe(null);
    }
  };

  const getHeaderTitle = () => {
    switch(activeScreen) {
      case 'import': return 'Import Recipe';
      case 'recipe-detail': return 'Recipe Extracted';
      case 'home': return 'My Kitchen';
      case 'settings': return 'Settings';
      default: return 'Reps For G';
    }
  };

  return (
    <Layout 
      activeScreen={activeScreen} 
      onScreenChange={setActiveScreen}
      headerTitle={getHeaderTitle()}
      showBackButton={activeScreen === 'recipe-detail'}
      onBack={handleBack}
    >
      {activeScreen === 'import' && (
        <ImportScreen 
          onExtract={handleExtract}
          isLoading={isLoading}
          recentRecipes={recentRecipes}
          onSelectRecipe={handleSelectRecipe}
        />
      )}
      
      {activeScreen === 'recipe-detail' && selectedRecipe && (
        <RecipeDetailScreen 
          recipe={selectedRecipe} 
          onUpdateRecipe={handleUpdateRecipe} 
        />
      )}

      {activeScreen === 'home' && (
        <div className="px-4 py-10 text-center space-y-6">
          <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <span className="material-symbols-outlined !text-4xl">inventory_2</span>
          </div>
          <h2 className="text-2xl font-bold">Your Cookbook is Empty</h2>
          <p className="text-zinc-500">Import your first recipe from YouTube to get started.</p>
          <button 
            onClick={() => setActiveScreen('import')}
            className="px-8 py-3 bg-primary rounded-lg font-bold"
          >
            Start Importing
          </button>
        </div>
      )}

      {activeScreen === 'settings' && (
        <div className="px-4 py-6 space-y-6">
          <h2 className="text-xl font-bold">App Settings</h2>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between">
              <span>Dark Mode</span>
              <div className="w-12 h-6 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 size-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between">
              <span>Measurement Units</span>
              <span className="text-primary font-bold">Metric</span>
            </div>
            <button 
              onClick={() => {
                localStorage.clear();
                setRecentRecipes([]);
                alert("Cache cleared!");
              }}
              className="w-full p-4 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/5 transition-colors"
            >
              Clear Recent Extractions
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
