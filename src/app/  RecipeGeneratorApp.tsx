"use client";

import React, { useState, useEffect } from "react";

// interfaces remain unchanged
interface InventoryItem {
  id: string;
  name: string;
  createdAt: string;
}

interface GeneratedRecipe {
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  notes?: string;
}

interface SavedRecipe extends GeneratedRecipe {
  id: string;
  createdAt: string;
}

// Define an interface for the expected Gemini API response structure
interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

const MessageModal: React.FC<{
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type: 'alert' | 'confirm';
  onClose: () => void;
}> = ({ message, onConfirm, onCancel, type, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center text-gray-800 flex flex-col gap-4 border border-gray-300">
        <p className="text-lg font-semibold">{message}</p>
        <div className="flex justify-center gap-4 mt-4">
          {type === 'confirm' && (
            <button
              onClick={() => {
                onCancel?.();
                onClose();
              }}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            autoFocus
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);

  const [pantryInput, setPantryInput] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [mealTypeInput, setMealTypeInput] = useState("");
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);

  const [modal, setModal] = useState({
    message: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
    onCancel: undefined as (() => void) | undefined,
    isVisible: false
  });

  const showModal = (message: string, type: 'alert' | 'confirm', onConfirm?: () => void, onCancel?: () => void) => {
    setModal({ message, type, onConfirm, onCancel, isVisible: true });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const storedInventory = localStorage.getItem('ingreedyInventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory) as InventoryItem[]);
    }

    const storedSavedRecipes = localStorage.getItem('ingreedyFavourites');
    if (storedSavedRecipes) {
      setSavedRecipes(JSON.parse(storedSavedRecipes) as SavedRecipe[]);
    }
  }, []);

  const handleAddPantryItem = async () => {
    const item = pantryInput.trim();
    if (!item) {
      showModal('Please enter a pantry item.', 'alert');
      return;
    }

    try {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: item,
        createdAt: new Date().toISOString()
      };
      const updatedInventory = [...inventory, newItem];
      setInventory(updatedInventory);
      localStorage.setItem('ingreedyInventory', JSON.stringify(updatedInventory));
      showModal(`${item} added to inventory.`, 'alert');
      setPantryInput("");
    } catch (e) {
      console.error("Error adding item:", e);
      showModal("Failed to add item to inventory.", 'alert');
    }
  };

  const handleDeleteInventoryItem = async (itemId: string) => {
    showModal(
      `Are you sure you want to remove this item from your inventory?`,
      'confirm',
      () => {
        try {
          const updatedInventory = inventory.filter(item => item.id !== itemId);
          setInventory(updatedInventory);
          localStorage.setItem('ingreedyInventory', JSON.stringify(updatedInventory));
          showModal('Item removed from inventory.', 'alert');
        } catch (e) {
          console.error("Error deleting item:", e);
          showModal("Failed to delete item from inventory.", 'alert');
        }
      }
    );
  };

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

    const inventoryNames = inventory.map(item => item.name).join(", ");

    const prompt = `I have the following ingredients in my pantry: ${inventoryNames}.
I want to cook a ${mealTypeInput}. My cooking skill level is "${skillLevel ?? "not specified"}".
Please give me 5 recipe ideas that use these items.
For each recipe, provide:
1. Recipe name (e.g., "Chicken Stir-fry")
2. Ingredients (bulleted list)
3. Instructions (numbered list)
4. Short notes/tips (optional)

Ensure the response is only the recipes in Markdown format, separated by a horizontal rule (---) between each recipe, without any conversational preamble or postamble.`;

    try {
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiKey = typeof __api_key !== 'undefined' ? __api_key : "";

      if (!apiKey) throw new Error("Gemini API Key is not configured.");

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error?.message ?? "Unknown error"}`);
      }

      // Explicitly type the result
      const result: GeminiApiResponse = await response.json();
      if (
        result?.candidates?.[0]?.content?.parts?.[0]?.text
      ) {
        const generatedText = result.candidates[0].content.parts[0].text;
        const parsed = parseGeneratedRecipes(generatedText);
        setGeneratedRecipes(parsed);
      } else {
        setGeneratorError("Could not generate recipes. Please try again.");
        console.error("Unexpected API response structure:", result);
      }
    } catch (err: unknown) { // Type err as unknown
      console.error("Error generating recipes:", err);
      if (err instanceof Error) {
        setGeneratorError(err.message ?? "An unexpected error occurred during recipe generation.");
      } else {
        setGeneratorError("An unexpected error occurred during recipe generation.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const parseGeneratedRecipes = (markdown: string): GeneratedRecipe[] => {
    // Split by horizontal rules, filter out empty blocks
    const recipeBlocks = markdown.split(/\n---\n|\n--- /).filter(block => block.trim() !== '');

    // Regex patterns for extraction (ensure they are new RegExp objects for exec)
    const titleRegex = /^##\s*(.*?)(\n|$)/m;
    const ingredientsRegex = /###\s*Ingredients:\n([\s\S]*?)(?=\n###|$)/m;
    const instructionsRegex = /###\s*Instructions:\n([\s\S]*?)(?=\n###|$)/m;
    const notesRegex = /###\s*Notes:\n([\s\S]*?)(\n|$)/m;

    return recipeBlocks.map(block => {
      // Use .exec() for each regex to get the match and capture groups
      const titleMatch = titleRegex.exec(block);
      const ingredientsMatch = ingredientsRegex.exec(block);
      const instructionsMatch = instructionsRegex.exec(block);
      const notesMatch = notesRegex.exec(block);

      return {
        title: titleMatch?.[1]?.trim() ?? "Untitled Recipe",
        description: "", // Description is not extracted from the current prompt format
        ingredients: ingredientsMatch?.[1]?.trim() ?? "No ingredients listed.",
        instructions: instructionsMatch?.[1]?.trim() ?? "No instructions provided.",
        notes: notesMatch?.[1]?.trim() ?? ""
      };
    });
  };

  // --- Saved Recipes Actions ---
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
      showModal(`&quot;${recipeToSave.title}&quot; saved to your recipes!`, 'alert');
    } catch (e) {
      console.error("Error saving recipe:", e);
      showModal("Failed to save recipe.", 'alert');
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const handleDeleteSavedRecipe = async (recipeId: string, recipeTitle: string) => {
    showModal(
      `Are you sure you want to remove &quot;${recipeTitle}&quot; from your saved recipes?`,
      'confirm',
      () => {
        try {
          const updatedSavedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId);
          setSavedRecipes(updatedSavedRecipes);
          localStorage.setItem('ingreedyFavourites', JSON.stringify(updatedSavedRecipes));
          showModal('Recipe removed from saved recipes.', 'alert');
        } catch (e) {
          console.error("Error deleting recipe:", e);
          showModal("Failed to delete recipe.", 'alert');
        }
      }
    );
  };

  // --- UI Components ---

  // Navbar Component
  const NavBar = () => (
    <nav className="w-full bg-indigo-950 bg-opacity-70 backdrop-blur-md shadow-lg p-4 flex justify-between items-center fixed top-0 left-0 z-50 rounded-b-xl">
      <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-blue-300">
        Ingreedy
      </div>
      <div className="flex space-x-2 sm:space-x-4">
        <button
          onClick={() => setCurrentPage('home')}
          className={`px-3 py-2 rounded-lg font-semibold transition-colors duration-200 ${currentPage === 'home' ? 'bg-purple-700 text-white' : 'text-gray-300 hover:text-white hover:bg-purple-800'}`}
        >
          Home
        </button>
        <button
          onClick={() => setCurrentPage('inventory')}
          className={`px-3 py-2 rounded-lg font-semibold transition-colors duration-200 ${currentPage === 'inventory' ? 'bg-purple-700 text-white' : 'text-gray-300 hover:text-white hover:bg-purple-800'}`}
        >
          Inventory
        </button>
        <button
          onClick={() => setCurrentPage('generate')}
          className={`px-3 py-2 rounded-lg font-semibold transition-colors duration-200 ${currentPage === 'generate' ? 'bg-purple-700 text-white' : 'text-gray-300 hover:text-white hover:bg-purple-800'}`}
        >
          Recipes
        </button>
        <button
          onClick={() => setCurrentPage('saved')}
          className={`px-3 py-2 rounded-lg font-semibold transition-colors duration-200 ${currentPage === 'saved' ? 'bg-purple-700 text-white' : 'text-gray-300 hover:text-white hover:bg-purple-800'}`}
        >
          Favourites
        </button>
      </div>
    </nav>
  );

  // Home Page Component
  const HomePage = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 mt-20 min-h-[calc(100vh-80px)]">
      <h2 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300 mb-6 drop-shadow-lg">
        Welcome to Ingreedy!
      </h2>
      <p className="text-xl sm:text-2xl text-gray-200 max-w-2xl mb-8">
        Add a pantry item or ingredient.
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-xl flex flex-col gap-6 border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            className="flex-grow p-3 rounded-lg bg-white/15 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
            placeholder="Enter Pantry Item"
            value={pantryInput}
            onChange={(e) => setPantryInput(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            className="flex-shrink-0 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 active:scale-95 text-white font-bold shadow-md transition duration-200"
            onClick={handleAddPantryItem}
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-xl">
        <button
          onClick={() => setCurrentPage('inventory')}
          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 active:scale-95 text-white font-bold shadow-md transition duration-200"
        >
          Inventory
        </button>
        <button
          onClick={() => setCurrentPage('generate')}
          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 active:scale-95 text-white font-bold shadow-md transition duration-200"
        >
          Recipes
        </button>
        <button
          onClick={() => setCurrentPage('saved')}
          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 active:scale-95 text-white font-bold shadow-md transition duration-200"
        >
          Favourites
        </button>
      </div>
    </div>
  );

  // Inventory Page Component (remains largely the same)
  const InventoryPage = () => (
    <div className="flex flex-col items-center p-4 sm:p-8 mt-20 min-h-[calc(100vh-80px)]">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-blue-300 mb-6 drop-shadow-lg">
        Your Pantry Inventory
      </h2>
      {inventory.length === 0 ? (
        <div className="text-gray-300 text-lg text-center mt-8">
          Your inventory is empty! Add items from the Home page.
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl flex flex-col gap-4 border border-white/20">
          <ul className="space-y-3">
            {inventory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((item) => (
              <li key={item.id} className="flex justify-between items-center bg-white/15 p-3 rounded-lg text-lg font-medium shadow-sm">
                <span>{item.name}</span>
                <button
                  onClick={() => handleDeleteInventoryItem(item.id)}
                  className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold py-1 px-3 rounded-lg shadow-md transition duration-200"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-xl">
        <button
          onClick={() => setCurrentPage('saved')}
          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 active:scale-95 text-white font-bold shadow-md transition duration-200"
        >
          Favourites
        </button>
        <button
          onClick={() => setCurrentPage('generate')}
          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 active:scale-95 text-white font-bold shadow-md transition duration-200"
        >
          Find Recipes
        </button>
      </div>
    </div>
  );

  // Generate Recipe Page Component (remains largely the same)
  const GenerateRecipePage = () => (
    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8 mt-20 min-h-[calc(100vh-80px)]">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-blue-300 mb-6 drop-shadow-lg">
        Generate New Recipes
      </h2>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl p-6 sm:p-10 w-full max-w-3xl flex flex-col gap-6 border border-white/20">
        <div className="flex flex-col gap-4">
          <label htmlFor="mealType" className="text-lg font-semibold text-gray-200 text-left">
            Meal Type (e.g., lunch, snack):
          </label>
          <input
            id="mealType"
            type="text"
            value={mealTypeInput}
            onChange={(e) => setMealTypeInput(e.target.value)}
            placeholder="Enter Meal Type"
            className="w-full p-3 rounded-lg bg-white/15 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
            autoFocus
          />

          <div className="text-lg font-semibold text-gray-200 text-left">Skill Level:</div>
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            <button
              onClick={() => setSkillLevel('beginner')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${skillLevel === 'beginner' ? 'bg-purple-700 text-white shadow-md' : 'bg-white/15 text-gray-300 hover:bg-purple-800'}`}
            >
              Never Touched a Knife
            </button>
            <button
              onClick={() => setSkillLevel('intermediate')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${skillLevel === 'intermediate' ? 'bg-purple-700 text-white shadow-md' : 'bg-white/15 text-gray-300 hover:bg-purple-800'}`}
            >
              Won&apos;t Burn Down the Kitchen
            </button>
            <button
              onClick={() => setSkillLevel('expert')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${skillLevel === 'expert' ? 'bg-purple-700 text-white shadow-md' : 'bg-white/15 text-gray-300 hover:bg-purple-800'}`}
            >
              Could Be on Master Chef
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerateRecipes}
          disabled={isGenerating || inventory.length === 0}
          className={`w-full p-3 rounded-lg font-bold text-lg shadow-md transition duration-300
            ${isGenerating || inventory.length === 0
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-95"
            }`}
        >
          {isGenerating ? "Generating Recipes..." : "Generate Recipes"}
        </button>

        {generatorError && (
          <div className="bg-red-500/20 border border-red-400 text-red-300 p-3 rounded-lg text-center">
            Error: {generatorError}
          </div>
        )}

        {generatedRecipes.length > 0 && (
          <div className="mt-6 p-6 bg-white/15 rounded-xl shadow-inner border border-white/20 overflow-auto max-h-[60vh] flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300 mb-4">
              Generated Recipes:
            </h3>
            {generatedRecipes.map((recipe, index) => (
              <div key={index} className="bg-white/10 p-4 rounded-lg shadow-md flex flex-col gap-2">
                <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">{recipe.title}</h4>
                <p className="text-gray-200 text-sm italic">{recipe.description}</p>
                <div className="prose prose-invert max-w-none text-gray-100 text-sm">
                  <p><strong>Ingredients:</strong> {recipe.ingredients}</p>
                  <p><strong>Instructions:</strong> {recipe.instructions}</p>
                  {recipe.notes && recipe.notes.trim() !== "" && (
                    <p><strong>Notes:</strong> {recipe.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleSaveRecipe(recipe)}
                  disabled={isSavingRecipe}
                  className={`mt-2 px-4 py-2 rounded-lg font-bold text-sm shadow-md transition duration-300
                    ${isSavingRecipe
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 active:scale-95"
                    }`}
                >
                  {isSavingRecipe ? "Saving..." : "Save Recipe"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Saved Recipes Page Component (remains largely the same)
  const SavedRecipesPage = () => (
    <div className="flex flex-col items-center p-4 sm:p-8 mt-20 min-h-[calc(100vh-80px)]">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-red-300 mb-6 drop-shadow-lg">
        Your Favourites
      </h2>
      {savedRecipes.length === 0 ? (
        <div className="text-gray-300 text-lg text-center mt-8">
          You haven&apos;t saved any favourite recipes yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {savedRecipes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((recipe) => (
            <div key={recipe.id} className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-6 flex flex-col justify-between border border-white/20 hover:scale-[1.02] transition-transform duration-200">
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
                  onClick={() => handleDeleteSavedRecipe(recipe.id, recipe.title)}
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

  // Recipe Detail Page Component (remains largely the same)
  const RecipeDetailPage = () => {
    if (!selectedRecipe) {
      setCurrentPage('saved');
      return null;
    }

    return (
      <div className="flex flex-col items-center p-4 sm:p-8 mt-20 min-h-[calc(100vh-80px)]">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300 mb-6 drop-shadow-lg text-center">
          {selectedRecipe.title}
        </h2>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl p-6 sm:p-10 w-full max-w-4xl flex flex-col gap-6 border border-white/20">
          <div className="prose prose-invert max-w-none text-gray-100">
            <h3>Ingredients:</h3>
            <p>{selectedRecipe.ingredients}</p>
            <h3>Instructions:</h3>
            <p>{selectedRecipe.instructions}</p>
            {selectedRecipe.notes && selectedRecipe.notes.trim() !== "" && (
              <>
                <h3>Notes:</h3>
                <p>{selectedRecipe.notes}</p>
              </>
            )}
          </div>
          <button
            onClick={() => setCurrentPage('saved')}
            className="mt-6 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
          >
            &larr; Back to Favourites
          </button>
        </div>
      </div>
    );
  };

  // --- Main App Render Logic ---
const renderPage = () => {
  switch (currentPage) {
    case 'home':
      return <HomePage />;
    case 'inventory':
      return <InventoryPage />;
    case 'generate':
      return <GenerateRecipePage />;
    case 'saved':
      return <SavedRecipesPage />;
    case 'recipeDetail':
      return <RecipeDetailPage />;
    default:
      return <HomePage />;
  }
};

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 text-white font-sans">
      <NavBar />
      <div className="pt-20 pb-8"> {/* Padding for fixed navbar and bottom user ID */}
        {renderPage()}
      </div>
      {modal.isVisible && (
        <MessageModal
          message={modal.message}
          type={modal.type}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
