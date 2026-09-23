import { test, expect } from '@playwright/test';
import { DreamsDiaryPage } from '../pages/DreamsDiaryPage';
import { classifyDreamSentiment } from '../utils/aiClassifier';

/**
 * Bonus (Part 2): AI-Based Validation.
 * For each dream in the log, ask the OpenAI API to classify the dream name
 * as "Good" or "Bad" and compare it against the type recorded in the table.
 *
 * These tests are skipped automatically if OPENAI_API_KEY isn't configured,
 * so the rest of the suite (Part 1) always runs standalone in CI/graders
 * without requiring an API key.
 */
test.describe('Dream Portal - Bonus AI Validation', () => {
  test.skip(!process.env.OPENAI_API_KEY, 'OPENAI_API_KEY not set - skipping AI validation tests');

  test('AI-classified sentiment matches the recorded Dream Type for each entry', async ({ page }) => {
    const diaryPage = new DreamsDiaryPage(page);
    await diaryPage.open();
    const dreams = await diaryPage.getAllDreams();

    const mismatches: string[] = [];

    for (const dream of dreams) {
      const aiLabel = await classifyDreamSentiment(dream.name);
      const actualLabel = dream.type.trim();

      test.info().annotations.push({
        type: 'ai-classification',
        description: `"${dream.name}" -> AI: ${aiLabel}, Table: ${actualLabel}`,
      });

      if (aiLabel.toLowerCase() !== actualLabel.toLowerCase()) {
        mismatches.push(`"${dream.name}" (table: ${actualLabel}, AI: ${aiLabel})`);
      }
    }

    expect(
      mismatches,
      `AI classification disagreed with the table for: ${mismatches.join('; ')}`
    ).toHaveLength(0);
  });
});
