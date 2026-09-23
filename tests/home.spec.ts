import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Dream Portal - Home Page (index.html)', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.open();
  });

  test('shows loading animation which disappears after ~3 seconds', async () => {
    await homePage.assertLoaderAppearsThenDisappears();
  });

  test('main content and "My Dreams" button become visible after loading', async () => {
    await homePage.assertLoaderAppearsThenDisappears();
    await homePage.assertMainContentVisible();
  });

  test('clicking "My Dreams" opens dreams-diary.html and dreams-total.html in new tabs', async ({
    page,
    context,
  }) => {
    await homePage.assertLoaderAppearsThenDisappears();
    await homePage.assertMainContentVisible();

    const popups = await homePage.clickMyDreamsAndCapturePopups(context);

    // At minimum one new tab must open with one of the expected pages.
    expect(popups.length).toBeGreaterThan(0);

    const urls = popups.map((p) => p.url());
    const hasDiary = urls.some((u) => u.includes('dreams-diary.html'));
    const hasTotal = urls.some((u) => u.includes('dreams-total.html'));

    // Soft assertions so the report clearly shows exactly which of the two
    // expected tabs did/didn't open, instead of failing on the first miss.
    expect.soft(hasDiary, `Expected one open tab to be dreams-diary.html. Got: ${urls.join(', ')}`).toBe(true);
    expect.soft(hasTotal, `Expected one open tab to be dreams-total.html. Got: ${urls.join(', ')}`).toBe(true);

    for (const popup of popups) {
      await expect(popup.locator('body')).toBeVisible();
    }
  });
});
