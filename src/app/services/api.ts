import type { GeminiApiResponse } from '../types/types';

const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const generateRecipes = async (prompt: string): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API Key is not configured.');
  }

  const chatHistory = [{ role: 'user', parts: [{ text: prompt }] }];
  const payload = { contents: chatHistory };
  const apiUrl = `${API_BASE_URL}?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData: GeminiApiResponse = await response.json()as GeminiApiResponse;
    throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error?.message ?? 'Unknown error'}`);
  }

  const result: GeminiApiResponse = await response.json()as GeminiApiResponse;
  if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
    return result.candidates[0].content.parts[0].text;
  }

  throw new Error('Could not generate recipes. Please try again.');
};