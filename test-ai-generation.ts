import dotenv from 'dotenv';
dotenv.config();
import { getSupabaseClient } from './api/_lib/services/supabase/client.js';

async function testAIGeneration() {
  const supabase = getSupabaseClient();

  console.log('🗑️  Rensar cache för att tvinga fram ny AI-generering...\n');

  // Rensa alla word_sets utom de med feedback (behåll DN-data i group_feedback tabellen)
  const { error: deleteError } = await supabase
    .from('word_sets')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('❌ Fel vid rensning:', deleteError);
    return;
  }

  console.log('✅ Cache rensad\n');
  console.log('🤖 Genererar nytt ordset med AI (detta tar 30-60 sekunder)...\n');

  // Anropa API:et för att generera nytt set
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:3001/api';

  const response = await fetch(`${apiUrl}/wordsets/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    console.error('❌ API error:', response.status, response.statusText);
    const text = await response.text();
    console.error('Response:', text);
    return;
  }

  const data = await response.json();

  if (!data.success) {
    console.error('❌ Generation failed:', data.error);
    return;
  }

  console.log('✅ Nytt ordset genererat!\n');
  console.log('📊 Resultat:');
  console.log('   ID:', data.word_set.id);
  console.log();

  data.word_set.groups.forEach((group: any, i: number) => {
    console.log(`${i + 1}. ${group.category}`);
    console.log(`   Ord: ${group.words.join(', ')}`);
    console.log(`   Förklaring: ${group.explanation}`);
    console.log();
  });
}

testAIGeneration();
