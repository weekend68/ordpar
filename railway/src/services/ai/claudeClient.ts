import Anthropic from '@anthropic-ai/sdk';

let anthropic: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
}

export async function callClaude(prompt: string): Promise<string> {
  const client = getClient();

  const message = await client.messages.create({
    model: 'claude-opus-4-5-20251101', // Opus 4.5 - bättre på svenska och komplexa uppgifter
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Expected text response from Claude');
  }

  return content.text;
}

export function parseJSON<T>(response: string): T {
  // Try direct parse first
  try {
    return JSON.parse(response);
  } catch (e) {
    // Strip markdown if present
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  }
}
