import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const modelsToTry = [
  'gemini-2.0-flash-thinking-exp',
  'gemini-2.0-flash-thinking-exp-01-21',
  'gemini-2.0-flash-thinking-exp-1219',
  'gemini-exp-1206',
  'gemini-2.0-flash-exp',
  'models/gemini-2.0-flash-thinking-exp-01-21'
];

async function testModel(modelName: string) {
  try {
    console.log(`\n🧪 Testar: ${modelName}`);
    const model = client.getGenerativeModel({ model: modelName });

    const result = await model.generateContent('Säg hej på svenska i en mening.');
    const text = result.response.text();

    console.log(`✅ ${modelName} fungerar!`);
    console.log(`Svar: ${text.substring(0, 100)}`);
    return true;
  } catch (error: any) {
    console.log(`❌ ${modelName} fungerar inte: ${error.message.substring(0, 150)}`);
    return false;
  }
}

console.log('🔍 Söker efter rätt Gemini 2.0 Flash Thinking-modell...\n');

for (const modelName of modelsToTry) {
  const works = await testModel(modelName);
  if (works) {
    console.log(`\n🎯 HITTAD! Använd: ${modelName}`);
    break;
  }
}
