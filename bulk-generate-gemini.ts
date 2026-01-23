import dotenv from 'dotenv';
dotenv.config();

const RAILWAY_URL = 'https://ordpar-production.up.railway.app';

async function generateWordSets(count: number) {
  console.log(`🚀 Genererar ${count} word sets med Gemini...\n`);

  const profile = {
    ordförråd: 'medel',
    ordlekar: 'medel',
    kulturella_referenser: 'medel',
    abstrakt_tänkande: 'medel'
  };

  for (let i = 1; i <= count; i++) {
    console.log(`\n📦 Set ${i}/${count}...`);

    try {
      const response = await fetch(`${RAILWAY_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_profile: profile })
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Set ${i} genererat!`);
        data.word_set.groups.forEach((g: any, idx: number) => {
          console.log(`   ${idx + 1}. ${g.category}`);
        });
      } else {
        console.log(`❌ Set ${i} misslyckades: ${data.error}`);
      }
    } catch (error: any) {
      console.log(`❌ Set ${i} error: ${error.message}`);
    }

    // Vänta lite mellan anrop för att inte överbelasta
    if (i < count) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n🎉 Klart! Genererade ${count} word sets.`);
}

// Generera 25 word sets
generateWordSets(25);
