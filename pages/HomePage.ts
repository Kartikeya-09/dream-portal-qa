import { Page, Locator, BrowserContext, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage -> index.html
 *
 * NOTE ON SELECTORS:
 * The AUT does not expose data-testid attributes, so locators below are based
 * on the visible copy/structure observed on the live site ("Loading your
 * dream portal...", "My Dreams" button, "Dream Portal" heading). If the site
 * markup changes, update the locators here only — tests should not need to
 * change since they go through this Page Object.
 */
export class HomePage extends BasePage {
  readonly loadingIndicator: Locator;
  readonly mainHeading: Locator;
  readonly myDreamsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.loadingIndicator = page.getByText(/loading your dream portal/i);
    this.mainHeading = page.getByRole('heading', { name: /dream portal/i });
    this.myDreamsButton = page.getByRole('link', { name: /my dreams/i })
      .or(page.getByRole('button', { name: /my dreams/i }));
  }

  async open() {
  await this.page.goto('', { waitUntil: 'commit' }); // was: await this.goto('/');
}

  /** Loader must be visible first, then disappear within ~3-5s. */
  async assertLoaderAppearsThenDisappears() {
    await expect(this.loadingIndicator).toBeVisible({ timeout: 2000 });
    await expect(this.loadingIndicator).toBeHidden({ timeout: 6000 });
  }

  async assertMainContentVisible() {
    await expect(this.mainHeading).toBeVisible();
    await expect(this.myDreamsButton).toBeVisible();
  }

  /**
   * Clicking "My Dreams" is expected to open dreams-diary.html AND
   * dreams-total.html in new tabs. We listen for two 'page' events on the
   * shared BrowserContext around the click.
   */
  async clickMyDreamsAndCapturePopups(context: BrowserContext): Promise<Page[]> {
    const popupPromise1 = context.waitForEvent('page');
    await this.myDreamsButton.click();

    const firstPopup = await popupPromise1;
    await firstPopup.waitForLoadState();

    // Give the app a brief window in case the second tab opens slightly after the first.
    let secondPopup: Page | null = null;
    try {
      secondPopup = await context.waitForEvent('page', { timeout: 5000 });
      await secondPopup.waitForLoadState();
    } catch {
      // If the site only opens one combined tab (e.g. a single results page),
      // this will simply stay null and the test will report accordingly.
      secondPopup = null;
    }

    return secondPopup ? [firstPopup, secondPopup] : [firstPopup];
  }
}
