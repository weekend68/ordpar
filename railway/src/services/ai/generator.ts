import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { callClaude, parseJSON } from './claudeClient.js';
import { GeneratedWordSet, DifficultyProfile } from '../../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateWordSet(
  difficultyLevel: string,
  playerProfile: DifficultyProfile,
  badPatterns: string[]
): Promise<GeneratedWordSet> {

  // Load prompt template
  const promptPath = path.join(__dirname, '../../prompts/generator.txt');
  const promptTemplate = await fs.readFile(promptPath, 'utf-8');

  // Format bad patterns for readability in prompt
  const badPatternsFormatted = badPatterns.length > 0
    ? badPatterns.map((pattern, i) => `${i + 1}. ${pattern}`).join('\n')
    : 'Inga dåliga mönster rapporterade än.';

  // Fill in variables
  const prompt = promptTemplate
    .replace('{difficulty_level}', difficultyLevel)
    .replace('{player_profile}', JSON.stringify(playerProfile, null, 2))
    .replace('{bad_patterns}', badPatternsFormatted);

  if (badPatterns.length > 0) {
    console.log(`⚠️  AI will avoid ${badPatterns.length} bad patterns`);
  }

  console.log('🤖 Generating word set with Claude...');

  // Call Claude API
  const response = await callClaude(prompt);

  // Parse response
  const parsed = parseJSON<GeneratedWordSet>(response);

  // Validate structure
  if (!parsed.groups || parsed.groups.length !== 6) {
    throw new Error(`Invalid generation: expected 6 groups, got ${parsed.groups?.length || 0}`);
  }

  console.log(`✅ Generated ${parsed.groups.length} groups`);

  return parsed;
}
