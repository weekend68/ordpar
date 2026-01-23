import dotenv from 'dotenv';
dotenv.config();
import { getSupabaseClient } from './api/_lib/services/supabase/client.js';
import fs from 'fs';

interface DNRating {
  category: string;
  words: string[];
  rating: 1 | 2 | 3 | 4 | 'excellent' | 'good' | 'too_easy' | 'bad';
  comment?: string;
}

type RatingText = 'excellent' | 'good' | 'too_easy' | 'bad';

function normalizeRating(rating: DNRating['rating']): RatingText {
  // Konvertera siffror till text
  // 4 = excellent (bäst)
  // 3 = good
  // 2 = too_easy
  // 1 = bad (sämst)
  if (rating === 4) return 'excellent';
  if (rating === 3) return 'good';
  if (rating === 2) return 'too_easy';
  if (rating === 1) return 'bad';

  // Om redan text, returnera som den är
  return rating as RatingText;
}

interface DNRatingsFile {
  ratings: DNRating[];
}

async function importDNData() {
  const supabase = getSupabaseClient();

  console.log('🗑️  Rensning av gammal data...\n');

  // Rensa games först (annars får vi foreign key constraint error)
  const { error: gamesError } = await supabase
    .from('games')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (gamesError) {
    console.error('❌ Fel vid rensning av games:', gamesError);
    return;
  }

  // Rensa all testdata (CASCADE tar hand om feedback automatiskt)
  const { error: deleteError } = await supabase
    .from('word_sets')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.error('❌ Fel vid rensning av word_sets:', deleteError);
    return;
  }

  console.log('✅ Gammal data rensad\n');

  // Läs DN-ratings från JSON
  const ratingsFile = fs.readFileSync('./dn-ratings.json', 'utf-8');
  const { ratings } = JSON.parse(ratingsFile) as DNRatingsFile;

  console.log(`📥 Läser ${ratings.length} DN-grupper från dn-ratings.json\n`);

  // Gruppera ratings i sets om 4 grupper
  const wordSets: DNRating[][] = [];
  for (let i = 0; i < ratings.length; i += 4) {
    wordSets.push(ratings.slice(i, i + 4));
  }

  console.log(`📦 Skapar ${wordSets.length} word sets (4 grupper per set)\n`);

  let successCount = 0;
  let feedbackCount = 0;

  for (const [setIndex, groups] of wordSets.entries()) {
    if (groups.length !== 4) {
      console.log(`⚠️  Set ${setIndex + 1}: Hoppar över (har bara ${groups.length} grupper, behöver 4)`);
      continue;
    }

    // Skapa word set
    const { data: wordSet, error: insertError } = await supabase
      .from('word_sets')
      .insert({
        groups: groups.map(g => ({
          category: g.category,
          words: g.words,
          explanation: g.comment || ''
        })),
        quality_score: 0,
        times_used: 0,
        used_by_users: []
      })
      .select('id')
      .single();

    if (insertError || !wordSet) {
      console.error(`❌ Set ${setIndex + 1}: Kunde inte skapa word set:`, insertError);
      continue;
    }

    // Skapa feedback för varje grupp
    const feedbackRecords = groups.map((g, groupIndex) => ({
      word_set_id: wordSet.id,
      group_index: groupIndex,
      rating: normalizeRating(g.rating)
    }));

    const { error: feedbackError } = await supabase
      .from('group_feedback')
      .insert(feedbackRecords);

    if (feedbackError) {
      console.error(`❌ Set ${setIndex + 1}: Kunde inte skapa feedback:`, feedbackError);
    } else {
      successCount++;
      feedbackCount += feedbackRecords.length;

      const ratingEmojis = groups.map(g => {
        const normalized = normalizeRating(g.rating);
        if (normalized === 'excellent') return '🔥';
        if (normalized === 'good') return '✅';
        if (normalized === 'too_easy') return '😴';
        return '❌';
      }).join(' ');

      console.log(`✅ Set ${setIndex + 1}/${wordSets.length}: ${wordSet.id.substring(0, 8)}... [${ratingEmojis}]`);
      console.log(`   ${groups.map(g => g.category).join(' | ')}`);
    }
  }

  console.log(`\n🎉 Import klar!`);
  console.log(`   📦 ${successCount} word sets skapade`);
  console.log(`   📊 ${feedbackCount} feedback-poster skapade`);
}

importDNData().catch(console.error);
