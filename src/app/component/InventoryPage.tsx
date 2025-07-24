import React from 'react';
import type { InventoryItem } from '../types/types';
import type { ModalState } from '../types/types';

interface InventoryPageProps {
  setCurrentPage: (page: string) => void;
  showModal: (message: string, type: ModalState['type'], onConfirm?: () => void) => void;
  inventory: InventoryItem[];
  removeItem: (id: string) => void;
}

const InventoryPage: React.FC<InventoryPageProps> = ({
  setCurrentPage,
  showModal,
  inventory,
  removeItem,
}) => {
  const handleDeleteInventoryItem = (itemId: string, itemName: string) => {
    showModal(
      `Are you sure you want to remove "${itemName}" from your inventory?`,
      'confirm',
      () => removeItem(itemId)
    );
  };

  return (
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
            {inventory
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center bg-white/15 p-3 rounded-lg text-lg font-medium shadow-sm"
                >
                  <span>{item.name}</span>
                  <button
                    onClick={() => handleDeleteInventoryItem(item.id, item.name)}
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
};

export default InventoryPage;