import React, { useState } from 'react';
import type { SavedRecipe, ModalState, GeneratedRecipe } from '../types/types';

interface SavedRecipesPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedRecipe: (recipe: SavedRecipe) => void;
  showModal: (message: string, type: ModalState['type'], onConfirm?: () => void) => void;
  savedRecipes: SavedRecipe[];removeRecipe: (id: string) => void;
  
  setSavedRecipes: (recipes: SavedRecipe[]) => void;
}

const SavedRecipesPage: React.FC<SavedRecipesPageProps> = ({
  setCurrentPage,
  setSelectedRecipe,
  showModal,
  savedRecipes,
  //removeRecipe,
  setSavedRecipes
}) => {
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);

  const handleSaveRecipe = async (recipeToSave: GeneratedRecipe) => {
    setIsSavingRecipe(true);
    try {
      const newSavedRecipe: SavedRecipe = {
        id: Date.now().toString(),
        ...recipeToSave,
        createdAt: new Date().toISOString()
      };
      const updatedSavedRecipes = [...savedRecipes, newSavedRecipe];
      setSavedRecipes(updatedSavedRecipes);
      localStorage.setItem('ingreedyFavourites', JSON.stringify(updatedSavedRecipes));
      showModal(`"${recipeToSave.title}" saved to your recipes!`, 'alert');
    } catch (e) {
      console.error("Error saving recipe:", e);
      showModal("Failed to save recipe", 'alert');
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const handleDeleteRecipe = (recipeId: string, recipeTitle: string) => {
    showModal(
      `Are you sure you want to remove "${recipeTitle}" from your saved recipes?`,
      'confirm',
      () => {
        try {
          const updatedSavedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId);
          setSavedRecipes(updatedSavedRecipes);
          localStorage.setItem('ingreedyFavourites', JSON.stringify(updatedSavedRecipes));
          showModal('Recipe removed from saved recipes.', 'alert');
        } catch (e) {
          console.error("Error deleting recipe:", e);
          showModal("Failed to delete recipe", 'alert');
        }
      }
    );
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 mt-20 min-h-[calc(100vh-80px)]">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-red-300 mb-6 drop-shadow-lg">
        Your Favourites
      </h2>
      {savedRecipes.length === 0 ? (
        <div className="text-gray-300 text-lg text-center mt-8">
          {"You haven't saved any favourite recipes yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {[...savedRecipes]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-6 flex flex-col justify-between border border-white/20 hover:scale-[1.02] transition-transform duration-200"
              >
                <div>
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300 mb-2 truncate">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {recipe.ingredients.split('\n').map(line => line.replace(/^- /, '')).join(', ').slice(0, 100) + '...'}
                  </p>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      setCurrentPage('recipeDetail');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                    className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SavedRecipesPage;