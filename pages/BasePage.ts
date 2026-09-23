import { Page } from '@playwright/test';

/**
 * BasePage
 * Shared helpers that every Page Object can reuse.
 * Keeping these here avoids duplicating "get all text" / "find stat" logic
 * across HomePage / DreamsDiaryPage / DreamsTotalPage.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '') {
    await this.page.goto(path);
  }

  /** Full visible text of <body>, useful for resilient regex-based assertions
   *  when the target site doesn't expose stable data-testid/id attributes. */
  async bodyText(): Promise<string> {
    return (await this.page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
  }

  /**
   * Finds a numeric statistic on the page next to a text label, e.g.
   * "Good Dreams: 6" or "Good Dreams 6" -> returns 6.
   * This is deliberately tolerant of markup differences (span/div/table cell)
   * since we don't control the AUT's DOM.
   */
  async getStatByLabel(label: string): Promise<number> {
    const text = await this.bodyText();
    const pattern = new RegExp(`${label}\\D{0,10}(\\d+)`, 'i');
    const match = text.match(pattern);
    if (!match) {
      throw new Error(`Could not find a numeric stat for label "${label}" in page text: "${text}"`);
    }
    return parseInt(match[1], 10);
  }
}
