import dotenv from 'dotenv';
dotenv.config();
import { getSupabaseClient } from './api/_lib/services/supabase/client.js';

async function checkDB() {
  const supabase = getSupabaseClient();

  // Kolla word_sets
  const { data: sets, error } = await supabase
    .from('word_sets')
    .select('id, groups, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`📊 Totalt ${sets?.length || 0} word sets i databasen\n`);

  sets?.forEach((set, i) => {
    console.log(`${i+1}. ID: ${set.id.substring(0, 8)}...`);
    console.log(`   Skapad: ${set.created_at}`);
    console.log(`   Grupper:`);
    set.groups.forEach((g: any) => {
      console.log(`     - ${g.category}: ${g.words.join(', ')}`);
    });
    console.log();
  });

  // Kolla feedback
  const { count } = await supabase
    .from('group_feedback')
    .select('*', { count: 'exact', head: true });

  console.log(`📝 Totalt ${count} feedback-poster i databasen`);
}

checkDB();
