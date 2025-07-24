import React, { useState } from 'react';
import type { GeneratedRecipe, InventoryItem, ModalState, SavedRecipe } from '../types/types';
import { generateRecipes } from '../services/recipeService';
import { useInventory } from '../hooks/useInventory';

interface GenerateRecipePageProps {
  setCurrentPage: (page: string) => void;
  showModal: (message: string, type: ModalState['type'], onConfirm?: () => void) => void;
  inventory: InventoryItem[];
  saveRecipe: (recipe: GeneratedRecipe) => Promise<SavedRecipe>;
}

const GenerateRecipePage: React.FC<GenerateRecipePageProps> = ({
  setCurrentPage,
  showModal,
  inventory,
  saveRecipe,
}) => {
  const [mealTypeInput, setMealTypeInput] = useState('');
  const [skillLevel, setSkillLevel] = useState<string>('medium');
  const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  const handleGenerateRecipes = async () => {
    if (!mealTypeInput.trim()) {
      showModal('Please enter a meal type.', 'alert');
      return;
    }
    if (inventory.length === 0) {
      showModal('Your inventory is empty! Add some items first.', 'alert');
      setCurrentPage('inventory');
      return;
    }

    setIsGenerating(true);
    setGeneratorError(null);
    setGeneratedRecipes([]);

    try {
      const ingredients = inventory.map(item => item.name);
      const recipes = await generateRecipes(ingredients, mealTypeInput, skillLevel);
      setGeneratedRecipes(recipes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recipes';
      setGeneratorError(errorMessage);
      showModal(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async (recipe: GeneratedRecipe) => {
    try {
      await saveRecipe(recipe);
      showModal(`"${recipe.title}" saved to favorites!`, 'success');
    } catch (err) {
      showModal('Failed to save recipe', 'error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8 mt-20 min-h-[calc(100vh-80px)]">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-blue-300 mb-6 drop-shadow-lg">
        Generate New Recipes
      </h2>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl p-6 sm:p-10 w-full max-w-3xl flex flex-col gap-6 border border-white/20">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            className="p-3 rounded-lg bg-white/15 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
            placeholder="Meal type (e.g., dinner, lunch, dessert)"
            value={mealTypeInput}
            onChange={(e) => setMealTypeInput(e.target.value)}
          />
          
          <select
            className="p-3 rounded-lg bg-white/15 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          
          <button
            onClick={handleGenerateRecipes}
            disabled={isGenerating}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 active:scale-95 text-white font-bold shadow-md transition duration-200 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Recipes'}
          </button>
        </div>

        {generatorError && (
          <div className="text-red-400 bg-red-900/30 p-3 rounded-lg">
            {generatorError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 mt-4">
          {generatedRecipes.map((recipe, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300 mb-4">
                {recipe.title}
              </h3>
              
              <div className="prose prose-invert max-w-none">
                <h4>Ingredients:</h4>
                <p className="whitespace-pre-line">{recipe.ingredients}</p>
                
                <h4>Instructions:</h4>
                <p className="whitespace-pre-line">{recipe.instructions}</p>
                
                {recipe.notes && (
                  <>
                    <h4>Notes:</h4>
                    <p className="whitespace-pre-line">{recipe.notes}</p>
                  </>
                )}
              </div>
              
              <button
                onClick={() => handleSaveRecipe(recipe)}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200"
              >
                Save Recipe
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenerateRecipePage;