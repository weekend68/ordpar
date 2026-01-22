import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { callClaude, parseJSON } from './claudeClient.js';
import { GeneratedWordSet, ValidationResult } from '../../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function validateWordSet(
  generatedGroups: GeneratedWordSet
): Promise<ValidationResult> {

  // Load prompt template
  const promptPath = path.join(__dirname, '../../../prompts/validator.txt');
  const promptTemplate = await fs.readFile(promptPath, 'utf-8');

  // Fill in the generated groups
  const prompt = promptTemplate.replace(
    '{generated_groups}',
    JSON.stringify(generatedGroups, null, 2)
  );

  console.log('🔍 Validating word set with Claude...');

  // Call Claude API
  const response = await callClaude(prompt);

  // Parse response
  const validation = parseJSON<ValidationResult>(response);

  console.log(`📊 Validation result: ${validation.overall_quality} (valid: ${validation.valid})`);
  console.log(`   Issues found: ${validation.issues.length}`);

  return validation;
}
