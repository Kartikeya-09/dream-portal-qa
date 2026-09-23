import { test, expect } from '@playwright/test';
import { DreamsTotalPage } from '../pages/DreamsTotalPage';
import { DreamsDiaryPage } from '../pages/DreamsDiaryPage';

test.describe('Dream Portal - Summary Page (dreams-total.html)', () => {
  let totalPage: DreamsTotalPage;

  test.beforeEach(async ({ page }) => {
    totalPage = new DreamsTotalPage(page);
    await totalPage.open();
  });

  test('shows correct Good Dreams count', async () => {
    expect(await totalPage.getGoodDreams()).toBe(6);
  });

  test('shows correct Bad Dreams count', async () => {
    expect(await totalPage.getBadDreams()).toBe(4);
  });

  test('shows correct Total Dreams count', async () => {
    expect(await totalPage.getTotalDreams()).toBe(10);
  });

  test('shows correct Recurring Dreams count', async () => {
    expect(await totalPage.getRecurringDreams()).toBe(2);
  });

  test('recurring count on this page matches recurring dreams derived from the diary log', async ({
    page,
    context,
  }) => {
    const diaryPageObj = context.pages().length ? await context.newPage() : page;
    const diaryPage = new DreamsDiaryPage(diaryPageObj);
    await diaryPage.open();

    const recurringFromDiary = await diaryPage.getRecurringDreamNames();
    const recurringFromTotals = await totalPage.getRecurringDreams();

    expect(recurringFromDiary.length).toBe(recurringFromTotals);
    expect(recurringFromDiary).toEqual(expect.arrayContaining(['Flying over mountains', 'Lost in maze']));

    if (diaryPageObj !== page) await diaryPageObj.close();
  });
});
