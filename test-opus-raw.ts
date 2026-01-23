import dotenv from 'dotenv';
dotenv.config();
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

console.log('🔥 Testar Opus 4.5 direkt (utan validation)...\n');

// Läs prompten
const prompt = fs.readFileSync('./railway/src/prompts/generator.txt', 'utf-8')
  .replace('{player_profile}', JSON.stringify({
    ordförråd: 'medel',
    ordlekar: 'medel',
    kulturella_referenser: 'medel',
    abstrakt_tänkande: 'medel'
  }, null, 2))
  .replace('{feedback}', 'Ingen feedback än.');

const message = await client.messages.create({
  model: 'claude-opus-4-5-20251101',
  max_tokens: 3000,
  messages: [{
    role: 'user',
    content: prompt
  }]
});

const content = message.content[0];
if (content.type === 'text') {
  console.log('📝 Opus svar:\n');
  console.log(content.text);
  console.log('\n---\n');

  // Försök parse JSON
  try {
    const cleaned = content.text.replace(/```json\n?|\n?```/g, '').trim();
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
  }
}
