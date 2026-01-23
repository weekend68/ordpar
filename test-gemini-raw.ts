import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

console.log('🔥 Testar Gemini 2.5 Flash direkt...\n');

// Läs prompten
const prompt = fs.readFileSync('./railway/src/prompts/generator.txt', 'utf-8')
  .replace('{player_profile}', JSON.stringify({
    ordförråd: 'medel',
    ordlekar: 'medel',
    kulturella_referenser: 'medel',
    abstrakt_tänkande: 'medel'
  }, null, 2))
  .replace('{feedback}', 'Ingen feedback än.');

const model = client.getGenerativeModel({
  model: 'gemini-2.5-flash'
  // Ingen systemInstruction, precis som webbgränssnittet
});

const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    maxOutputTokens: 8000, // Högre limit för 6 grupper
    temperature: 1.0
  }
});

const response = result.response;
const text = response.text();

console.log('📝 Gemini svar (raw):\n');
console.log(text);
console.log('\n---\n');

// Försök parse JSON
try {
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  console.log('✅ JSON är valid!');
  console.log(`📊 Antal grupper: ${parsed.groups?.length || 0}`);

  if (parsed.groups) {
    parsed.groups.forEach((g: any, i: number) => {
      console.log(`\n${i+1}. ${g.category}`);
      console.log(`   ${g.words.join(', ')}`);
    });
  }
} catch (e: any) {
  console.log('❌ JSON parse error:', e.message);
  console.log('\nVisa första 500 tecken av cleaned:');
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  console.log(cleaned.substring(0, 500));
}
