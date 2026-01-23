import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function callClaude(prompt: string): Promise<string> {
  const client = getClient();

  // Gemini 2.5 Flash - bäst på svenska ordlekar
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash'
  });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 8000, // Högre limit för 6 grupper med förklaringar
      temperature: 1.0
    }
  });

  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error('Expected text response from Gemini');
  }

  return text;
}

export function parseJSON<T>(response: string): T {
  // Try direct parse first
  try {
    return JSON.parse(response);
  } catch (e) {
    // Strip markdown if present
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  }
}
