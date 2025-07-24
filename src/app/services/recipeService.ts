// app/services/recipeService.ts
import type { GeminiApiResponse, GeneratedRecipe } from '../types/types';

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`;

const generateRecipes = async (
  ingredients: string[],
  mealType: string,
  skillLevel: string
): Promise<GeneratedRecipe[]> => {
  const prompt = `I have the following ingredients in my pantry: ${ingredients.join(', ')}.
I want to cook a ${mealType}. My cooking skill level is "${skillLevel || "not specified"}".
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
    const apiKey = "process.env.NEXT_PUBLIC_GEMINI_API_KEY";

    if (!apiKey) throw new Error("Gemini API Key is not configured.");

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

        interface ErrorResponse {
      error?: {
      message?: string;
    };
}

    if (!response.ok) {
      const errorData = await response.json() as ErrorResponse;
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error?.message ?? "Unknown error"}`);
    }

    const result: GeminiApiResponse = await response.json() as GeminiApiResponse;
    
    if (
      result.candidates?.[0]?.content?.parts?.[0]?.text
    ) {
      const generatedText = result.candidates[0].content.parts[0].text;
      return parseGeneratedRecipes(generatedText);
    } else {
      throw new Error("Could not generate recipes. Invalid API response structure.");
    }
  } catch (err: unknown) {
    console.error("Error generating recipes:", err);
    throw err; // Re-throw the error to be handled by the caller
  }
};

const parseGeneratedRecipes = (markdown: string): GeneratedRecipe[] => {
  const recipeBlocks = markdown.split(/\n---\n|\n--- /).filter(block => block.trim() !== '');
  
  return recipeBlocks.map(block => {
    // Pre-compile regular expressions
    const titleRegex = /^#+\s*(.*?)(\n|$)/m;
    const ingredientsRegex = /###?\s*Ingredients?:\n([\s\S]*?)(?=\n###|$)/mi;
    const instructionsRegex = /###?\s*Instructions?:\n([\s\S]*?)(?=\n###|$)/mi;
    const notesRegex = /###?\s*Notes?:\n([\s\S]*?)(?=\n###|$)/mi;

    // Extract components
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
export {generateRecipes};