import { test, expect } from '@playwright/test';
import { DreamsDiaryPage } from '../pages/DreamsDiaryPage';

test.describe('Dream Portal - Dream Log (dreams-diary.html)', () => {
  let diaryPage: DreamsDiaryPage;

  test.beforeEach(async ({ page }) => {
    diaryPage = new DreamsDiaryPage(page);
    await diaryPage.open();
  });

  test('has exactly 10 dream entries', async () => {
    const count = await diaryPage.rowCount();
    expect(count).toBe(10);
  });

  test('every dream type is either "Good" or "Bad"', async () => {
    const dreams = await diaryPage.getAllDreams();
    expect(dreams.length).toBeGreaterThan(0);

    for (const dream of dreams) {
      expect(
        ['good', 'bad'].includes(dream.type.trim().toLowerCase()),
        `Unexpected dream type "${dream.type}" for dream "${dream.name}"`
      ).toBe(true);
    }
  });

  test('every row has Dream Name, Days Ago, and Dream Type filled in', async () => {
    const dreams = await diaryPage.getAllDreams();
    expect(dreams.length).toBeGreaterThan(0);

    for (const [index, dream] of dreams.entries()) {
      expect(dream.name, `Row ${index + 1}: Dream Name is empty`).not.toBe('');
      expect(dream.daysAgo, `Row ${index + 1}: Days Ago is empty`).not.toBe('');
      expect(dream.type, `Row ${index + 1}: Dream Type is empty`).not.toBe('');
    }
  });

  test('"Flying over mountains" and "Lost in maze" are recurring dreams', async () => {
    const recurring = await diaryPage.getRecurringDreamNames();
    expect(recurring).toEqual(expect.arrayContaining(['Flying over mountains', 'Lost in maze']));
    expect(recurring.length).toBe(2);
  });
});
