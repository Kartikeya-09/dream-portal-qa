import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface DreamRow {
  name: string;
  daysAgo: string;
  type: string;
}

/**
 * DreamsDiaryPage -> dreams-diary.html
 * Represents the table of dream log entries.
 *
 * SELECTOR NOTE: assumes the log is rendered as an HTML <table> with one
 * <tbody><tr> per dream and 3 <td> cells (Dream Name, Days Ago, Dream Type).
 * If the real markup uses divs/cards instead of a <table>, only the
 * `rows` locator below needs to change.
 */
export class DreamsDiaryPage extends BasePage {
  readonly table: Locator;
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);
    this.table = page.locator('table');
    this.rows = page.locator('table tbody tr');
  }

  async open() {
    await this.goto('dreams-diary.html');
  }

  async rowCount(): Promise<number> {
    return this.rows.count();
  }

  /** Extracts all dream rows as plain data for easy assertions. */
  async getAllDreams(): Promise<DreamRow[]> {
    const count = await this.rowCount();
    const dreams: DreamRow[] = [];

    for (let i = 0; i < count; i++) {
      const cells = this.rows.nth(i).locator('td');
      const cellCount = await cells.count();

      const name = cellCount > 0 ? (await cells.nth(0).innerText()).trim() : '';
      const daysAgo = cellCount > 1 ? (await cells.nth(1).innerText()).trim() : '';
      const type = cellCount > 2 ? (await cells.nth(2).innerText()).trim() : '';

      dreams.push({ name, daysAgo, type });
    }

    return dreams;
  }

  /** Returns dream names that appear more than once in the log (recurring dreams). */
  async getRecurringDreamNames(): Promise<string[]> {
    const dreams = await this.getAllDreams();
    const counts = new Map<string, number>();
    for (const d of dreams) {
      counts.set(d.name, (counts.get(d.name) ?? 0) + 1);
    }
    return [...counts.entries()].filter(([, count]) => count > 1).map(([name]) => name);
  }
}
