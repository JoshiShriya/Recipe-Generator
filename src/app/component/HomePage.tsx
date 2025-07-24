import React from 'react';
import type { ModalState } from '../types/types';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
  showModal: (message: string, type: ModalState['type'], onConfirm?: () => void) => void;
  pantryInput: string;
  setPantryInput: (value: string) => void;
  addItem: (name: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  setCurrentPage, 
  showModal,
  pantryInput,
  setPantryInput,
  addItem
}) => {
  const handleAddPantryItem = () => {
    const item = pantryInput.trim();
    if (!item) {
      showModal('Please enter a pantry item.', 'alert');
      return;
    }
    addItem(item); // This will now properly save to localStorage
    setPantryInput('');
  };

  return (
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
};

export default HomePage;