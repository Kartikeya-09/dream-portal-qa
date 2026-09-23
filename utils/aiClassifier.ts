import OpenAI from 'openai';

/**
 * Bonus AI validation (Part 2 of the assignment).
 * Classifies a dream name as "Good" or "Bad" using the OpenAI API and
 * returns a normalized label so it can be compared against the table's
 * "Dream Type" column.
 *
 * Requires OPENAI_API_KEY to be set (see .env.example). If it isn't set,
 * callers should skip the AI tests rather than fail the whole suite --
 * see tests/ai-validation.spec.ts.
 */

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return client;
}

export async function classifyDreamSentiment(dreamName: string): Promise<'Good' | 'Bad'> {
  const openai = getClient();

  const response = await openai.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content:
          'You classify dream journal entry titles as either "Good" or "Bad" based on whether the ' +
          'dream sounds pleasant/positive or unsettling/negative. Reply with exactly one word: ' +
          'Good or Bad. No punctuation, no explanation.',
      },
      {
        role: 'user',
        content: `Dream name: "${dreamName}"`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim().toLowerCase() ?? '';
  if (raw.startsWith('good')) return 'Good';
  if (raw.startsWith('bad')) return 'Bad';
  throw new Error(`Unexpected AI classification response for "${dreamName}": "${raw}"`);
}
