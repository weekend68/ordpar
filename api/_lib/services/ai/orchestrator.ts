import { generateWordSet } from './generator.js';
import { validateWordSet } from './validator.js';
import { selectBest4Groups } from './selector.js';
import { DifficultyProfile, WordGroup } from '../../types.js';

export async function generateValidatedWordSet(
  difficultyLevel: 'LÄTT' | 'MEDEL' | 'SVÅR' | 'EXPERT',
  playerProfile: DifficultyProfile,
  badPatterns: string[] = []
): Promise<WordGroup[]> {

  const maxAttempts = 2; // Reduced for Vercel timeout
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`\n🎲 Attempt ${attempts}/${maxAttempts} to generate word set...`);

    try {
      // Step 1: Generate 6 groups
      const generated = await generateWordSet(
        difficultyLevel,
        playerProfile,
        badPatterns
      );

      // Step 2: Validate
      const validation = await validateWordSet(generated);

      // Step 3: Check if acceptable
      if (!validation.valid) {
        console.log(`❌ Validation failed (not valid)`);
        console.log(`   Critical issues: ${validation.issues.filter(i => i.severity === 'critical').length}`);

        if (attempts < maxAttempts) {
          console.log(`   Retrying...`);
          continue;
        } else {
          throw new Error('Failed to generate valid word set after 2 attempts');
        }
      }

      // Accept acceptable quality or better (not just good/excellent)
      if (validation.overall_quality === 'poor') {
        console.log(`❌ Quality too low: ${validation.overall_quality}`);

        if (attempts < maxAttempts) {
          console.log(`   Retrying...`);
          continue;
        }
        // On last attempt, accept if valid even if quality is poor
        console.log(`⚠️  Accepting poor quality on last attempt (valid: ${validation.valid})`);
      }

      // Step 4: Select best 4 from 6
      console.log(`✅ Generated valid set with ${validation.overall_quality} quality`);
      const selectedGroups = selectBest4Groups(
        generated.groups,
        validation.group_quality
      );

      return selectedGroups;

    } catch (error) {
      console.error(`❌ Error in attempt ${attempts}:`, error);

      if (attempts >= maxAttempts) {
        throw error;
      }
    }
  }

  throw new Error('Failed to generate word set');
}
