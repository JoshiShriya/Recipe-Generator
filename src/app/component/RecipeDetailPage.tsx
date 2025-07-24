import React from 'react';
import type { SavedRecipe } from '../types/types';

interface RecipeDetailPageProps {
  selectedRecipe: SavedRecipe | null;
  setCurrentPage: (page: string) => void;
}

const RecipeDetailPage: React.FC<RecipeDetailPageProps> = ({ selectedRecipe, setCurrentPage }) => {
  if (!selectedRecipe) {
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
          ← Back to Favourites
        </button>
      </div>
    </div>
  );
};

export default RecipeDetailPage;