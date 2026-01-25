/**
 * Test script for AI generator - outputs to console only, NO database saves
 */

import 'dotenv/config';
import { generateWordSet } from './src/services/ai/generator.js';
import { DifficultyProfile } from './src/types.js';
import fs from 'fs';

// Default player profile
const defaultProfile: DifficultyProfile = {
  ordförråd: 'medel',
  ordlekar: 'medel',
  kulturella_referenser: 'medel',
  abstrakt_tänkande: 'medel'
};

// No feedback for testing
const feedback = '';

async function testGenerator() {
  console.log('🎲 Testing word set generator...\n');
  console.log('Player profile:', defaultProfile);
  console.log('Feedback:', feedback || '(none)');
  console.log('\n⏳ Generating word set (this may take 10-30 seconds)...\n');

  try {
    const result = await generateWordSet(defaultProfile, feedback);

    console.log('✅ Generation successful!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log(JSON.stringify(result, null, 2));
    console.log('═══════════════════════════════════════════════════════');

    // Also save to file
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `test-output-${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(result, null, 2));
    console.log(`\n💾 Saved to: ${filename}`);

  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

testGenerator();
