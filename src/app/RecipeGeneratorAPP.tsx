'use client';

import { useState } from 'react';
import NavBar from './component/NavBar';
import HomePage from './component/HomePage';
import InventoryPage from './component/InventoryPage';
import GenerateRecipePage from './component/GenerateRecipePage';
import SavedRecipesPage from './component/SavedRecipesPage';
import RecipeDetailPage from './component/RecipeDetailPage';
import MessageModal from './component/MessageModal';
import { useModal } from './hooks/useModal';
import { useRecipes } from './hooks/useRecipe';
import { useInventory } from './hooks/useInventory';
import type {SavedRecipe } from './types/types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);
  const { modalState, showModal, closeModal } = useModal();
  
  // Add these hooks
  const { savedRecipes, saveRecipe, removeRecipe } = useRecipes();
  const { inventory, pantryInput, setPantryInput, addItem, removeItem } = useInventory();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            setCurrentPage={setCurrentPage} 
            showModal={showModal}
            // Pass inventory-related props
            pantryInput={pantryInput}
            setPantryInput={setPantryInput}
            addItem={addItem}
          />
        );
      case 'inventory':
        return (
          <InventoryPage 
            setCurrentPage={setCurrentPage} 
            showModal={showModal} 
            inventory={inventory} 
            removeItem={removeItem} 
          />
        );
      case 'generate':
        return (
          <GenerateRecipePage 
            setCurrentPage={setCurrentPage} 
            showModal={showModal} 
            inventory={inventory} 
            saveRecipe={saveRecipe} 
          />
        );
      case 'saved':
        return (
          <SavedRecipesPage
            setCurrentPage={setCurrentPage}
            setSelectedRecipe={setSelectedRecipe}
            showModal={showModal}
            savedRecipes={savedRecipes}
            removeRecipe={removeRecipe} setSavedRecipes={function (reipes: SavedRecipe[]): void {
              throw new Error('Function not implemented.');
            } }          />
        );
      case 'recipeDetail':
        return (
          <RecipeDetailPage
            selectedRecipe={selectedRecipe}
            setCurrentPage={setCurrentPage}
          />
        );
      default:
        return <HomePage setCurrentPage={setCurrentPage} showModal={showModal} pantryInput={''} setPantryInput={function (value: string): void {
          throw new Error('Function not implemented.');
        } } addItem={function (name: string): void {
          throw new Error('Function not implemented.');
        } } />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 text-white font-sans">
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="pt-20 pb-8">
        {renderPage()}
      </div>
      {modalState.isVisible && (
        <MessageModal
          message={modalState.message}
          type={modalState.type}
          onConfirm={modalState.onConfirm}
          onCancel={modalState.onCancel}
          onClose={closeModal}
        />
      )}
    </div>
  );
}