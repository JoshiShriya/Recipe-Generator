// app/services/recipeService.ts
import type { GeminiApiResponse, GeneratedRecipe } from '../types/types';

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`;

export const generateRecipes = async (
  ingredients: string[],
  mealType: string,
  skillLevel: string
): Promise<GeneratedRecipe[]> => {
  const prompt = `Create 3 detailed recipes using these ingredients: ${ingredients.join(', ')}. 
  Meal type: ${mealType}. Skill level: ${skillLevel}. 
  Format each recipe as: 
  "## [Name]
  ### Ingredients:
  - [List]
  ### Instructions:
  1. [Steps]
  ### Notes:
  [Tips]"`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data: GeminiApiResponse = await response.json() as GeminiApiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return parseGeneratedRecipes(text);
  } catch (error) {
    console.error('Recipe generation failed:', error);
    throw error;
  }
};

  const parseGeneratedRecipes = (markdown: string): GeneratedRecipe[] => {
    const recipeBlocks = markdown.split(/\n---\n|\n--- /).filter(block => block.trim() !== '');
    return recipeBlocks.map(block => {
        // Pre-compile regular expressions
        const titleRegex = /^##\s*(.*?)(\n|$)/m;
        const ingredientsRegex = /###\s*Ingredients:\n([\s\S]*?)(?=\n###|$)/m;
        const instructionsRegex = /###\s*Instructions:\n([\s\S]*?)(?=\n###|$)/m;
        const notesRegex = /###\s*Notes:\n([\s\S]*?)(\n|$)/m;

        // Use RegExp.exec() for matching
        const titleMatch = titleRegex.exec(block);
        const ingredientsMatch = ingredientsRegex.exec(block);
        const instructionsMatch = instructionsRegex.exec(block);
        const notesMatch = notesRegex.exec(block);

        return {
            title: titleMatch?.[1]?.trim() ?? "Untitled Recipe",
            description: "",
            ingredients: ingredientsMatch?.[1]?.trim() ?? "No ingredients listed.",
            instructions: instructionsMatch?.[1]?.trim() ?? "No instructions provided.",
            notes: notesMatch?.[1]?.trim() ?? ""
        };
    });
};
