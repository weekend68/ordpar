import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const dnWordSets = [
  {
    difficulty_level: 'MEDEL',
    groups: [
      {
        category: 'Innehåller ett motorfordon',
        words: ['SIFFERKOMBI', 'SVEPA', "MCDONALD'S", 'VESUVIUS'],
      },
      {
        category: 'Klassiska drinkar',
        words: ['MANHATTAN', 'COSMO', 'MIMOSA', 'MARGARITA'],
      },
      {
        category: 'Slutar med två likadana vokaler',
        words: ['HAWAII', 'TAXFREE', 'TENNESSEE', 'DIDGERIDOO'],
      },
      {
        category: 'Kommer sist',
        words: ['JUMBO', 'Ö', 'NYÅRSAFTON', 'FINAL'],
      },
    ],
  },
  {
    difficulty_level: 'MEDEL',
    groups: [
      {
        category: 'Bildar 2026 med romerska siffror',
        words: ['MM', 'XX', 'V', 'I'],
      },
      {
        category: 'Kungen',
        words: ['XVI', 'SILVIA', 'STATSCHEF', 'ÖREBROARE'],
      },
      {
        category: 'Hör hemma i Dalarna',
        words: ['DD', 'KURBITS', 'KULLA', 'DALHALLA'],
      },
      {
        category: 'Förknippas med kopia',
        words: ['CC', 'EX', 'KLON', 'REPLIK'],
      },
    ],
  },
  {
    difficulty_level: 'MEDEL',
    groups: [
      {
        category: 'Mage',
        words: ['BUK', 'MAVE', 'PANNA', 'VOMB'],
      },
      {
        category: 'Typer av knep',
        words: ['TRICK', 'LIST', 'FINTER', 'KNÅP'],
      },
      {
        category: 'Puffar',
        words: ['KNUFF', 'SLAG', 'DUNK', 'PUFF'],
      },
      {
        category: 'Innehåller en kroppsdel',
        words: ['ARMBAND', 'BENSIN', 'NACKA', 'HALLAND'],
      },
    ],
  },
];

async function seed() {
  console.log('🌱 Seeding word sets to Supabase...\n');

  for (const wordSet of dnWordSets) {
    const { data, error } = await supabase
      .from('word_sets')
      .insert({
        difficulty_level: wordSet.difficulty_level,
        groups: wordSet.groups,
        quality_score: 4.5, // DN quality
        times_used: 0,
        used_by_users: [],
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Failed to insert:', error);
    } else {
      console.log(`✅ Inserted word set: ${data.id}`);
    }
  }

  console.log('\n✨ Seeding complete!');
}

seed();
