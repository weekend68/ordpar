/**
 * Test script for AI validator - reads JSON files from disk
 * Usage: npm run test:validator <filename>
 */

import 'dotenv/config';
import { validateWordSet } from './src/services/ai/validator.js';
import { GeneratedWordSet } from './src/types.js';
import fs from 'fs';

async function testValidator() {
  const filename = process.argv[2];

  if (!filename) {
    console.error('❌ Please provide a filename');
    console.log('Usage: npm run test:validator <filename>');
    console.log('\nExample:');
    console.log('  npm run test:validator test-output-2026-01-23T23-54-34.json');
    process.exit(1);
  }

  if (!fs.existsSync(filename)) {
    console.error(`❌ File not found: ${filename}`);
    process.exit(1);
  }

  console.log(`📂 Reading word set from: ${filename}\n`);

  try {
    const content = fs.readFileSync(filename, 'utf-8');
    const wordSet: GeneratedWordSet = JSON.parse(content);

    console.log(`Found ${wordSet.groups.length} groups:`);
    wordSet.groups.forEach((g, i) => {
      console.log(`  ${i + 1}. ${g.category} (${g.difficulty})`);
      console.log(`     ${g.words.join(', ')}`);
    });

    console.log('\n⏳ Validating with AI...\n');

    const validation = await validateWordSet(wordSet);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('VALIDATION RESULT:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(JSON.stringify(validation, null, 2));
    console.log('═══════════════════════════════════════════════════════');

    // Save validation result
    const outputFilename = filename.replace('.json', '-validation.json');
    fs.writeFileSync(outputFilename, JSON.stringify(validation, null, 2));
    console.log(`\n💾 Validation saved to: ${outputFilename}`);

    // Print summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Overall quality: ${validation.overall_quality}`);
    console.log(`   Valid: ${validation.valid ? '✅ YES' : '❌ NO'}`);
    console.log(`   Issues: ${validation.issues.length}`);

    if (validation.issues.length > 0) {
      console.log('\n⚠️  ISSUES FOUND:');
      validation.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${JSON.stringify(issue, null, 2)}`);
      });
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

testValidator();
