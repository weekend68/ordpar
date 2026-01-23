import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('📝 Reading migration file...');
    const sql = readFileSync('./backend/supabase/migrations/004_multiplayer_sessions.sql', 'utf8');

    console.log('🚀 Executing migration...');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`  Executing statement ${i + 1}/${statements.length}...`);

      const { error } = await supabase.rpc('exec_sql', { sql: stmt });

      if (error) {
        // Try direct approach if RPC doesn't work
        console.log(`  (trying alternative method)`);
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ query: stmt }),
        });

        if (!response.ok) {
          throw new Error(`Failed to execute statement: ${await response.text()}`);
        }
      }
    }

    console.log('✅ Migration completed successfully!');

    // Test the generate_session_code function
    console.log('\n🧪 Testing generate_session_code function...');
    const { data, error } = await supabase.rpc('generate_session_code');

    if (error) {
      console.error('❌ Function test failed:', error);
    } else {
      console.log('✅ Generated test code:', data);
    }

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
