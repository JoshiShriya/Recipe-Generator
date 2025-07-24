import { useState, useEffect } from 'react';
import type { GeneratedRecipe, SavedRecipe } from '../types/types';

const SAVED_RECIPES_KEY = 'ingreedyFavourites';

export const useRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
  const storedRecipes = localStorage.getItem('savedRecipes');
  if (storedRecipes) {
    try {
      const parsedRecipes: SavedRecipe[] = JSON.parse(storedRecipes) as SavedRecipe[];
      setSavedRecipes(parsedRecipes);
    } catch (error) {
      console.error('Failed to parse saved recipes', error);
      // Optionally handle the error (e.g., show a toast/modal)
    }
  }
}, []);

  const saveRecipe = async (recipe: GeneratedRecipe): Promise<SavedRecipe> => {
  setIsSaving(true);
  try {
    const newRecipe: SavedRecipe = {
      ...recipe,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedRecipes = [...savedRecipes, newRecipe];
    setSavedRecipes(updatedRecipes);
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(updatedRecipes));
    return newRecipe;
  } finally {
    setIsSaving(false);
  }
};

  const removeRecipe = (id: string) => {
    const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== id);
    setSavedRecipes(updatedRecipes);
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(updatedRecipes));
  };

  return { savedRecipes, isSaving, saveRecipe, removeRecipe };
};