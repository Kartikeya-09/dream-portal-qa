import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * DreamsTotalPage -> dreams-total.html
 * Represents the summary/stats page.
 *
 * SELECTOR NOTE: stats are read via a resilient label+number regex
 * (see BasePage.getStatByLabel) rather than brittle CSS selectors, since the
 * AUT doesn't expose stable ids/classes for each stat. Swap in a direct
 * locator (e.g. page.locator('#goodDreamsCount')) if/when those exist.
 */
export class DreamsTotalPage extends BasePage {
  async open() {
    await this.goto('/dreams-total.html');
  }

  async getGoodDreams(): Promise<number> {
    return this.getStatByLabel('Good Dreams');
  }

  async getBadDreams(): Promise<number> {
    return this.getStatByLabel('Bad Dreams');
  }

  async getTotalDreams(): Promise<number> {
    return this.getStatByLabel('Total Dreams');
  }

  async getRecurringDreams(): Promise<number> {
    return this.getStatByLabel('Recurring Dreams');
  }
}
