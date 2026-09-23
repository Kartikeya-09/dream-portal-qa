# Dream Portal QA — Automated Test Suite

Automated functional test suite for the **Dream Portal** dream-journaling site
(https://arjitnigam.github.io/myDreams/), built with **Playwright (TypeScript)**
following the Page Object Model, as required by the QA Intern Assignment.

**Status: 13/13 tests passing** against the live site (see `screenshots/`).

## Tech Stack

- **Playwright Test** (TypeScript) — browser automation & assertions
- **Page Object Model (POM)** — `pages/` folder, one class per page
- **HTML report** (built-in) + **Allure report** — visual test reports
- **Groq API (Llama 3.1, open-source model)** — bonus AI-based sentiment
  validation, via Groq's free OpenAI-compatible endpoint

## Project Structure

```
dream-portal-qa/
├── pages/                     # Page Object Model
│   ├── BasePage.ts            # shared helpers (navigation, resilient stat parsing)
│   ├── HomePage.ts            # index.html
│   ├── DreamsDiaryPage.ts     # dreams-diary.html
│   └── DreamsTotalPage.ts     # dreams-total.html
├── tests/
│   ├── home.spec.ts           # Part 1: loading animation, nav, new tabs
│   ├── diary.spec.ts          # Part 1: 10 entries, types, filled columns, recurring
│   ├── total.spec.ts          # Part 1: summary stats (Good/Bad/Total/Recurring)
│   └── ai-validation.spec.ts  # Part 2 (bonus): AI dream-type classification
├── utils/
│   └── aiClassifier.ts        # Groq (Llama) wrapper used by the bonus tests
├── screenshots/                # Test run evidence for submission (see below)
├── playwright.config.ts
├── package.json
├── .env.example
└── .github/workflows/tests.yml
```

## Setup

1. **Install dependencies**

   ```bash
   npm install
   npx playwright install --with-deps
   ```

2. **(Optional, for bonus AI tests) configure your Groq API key**

   Groq (https://console.groq.com/keys) offers a free API key and runs
   open-source models — satisfying the assignment's "OpenAI API or any open
   source model" bonus clause without requiring a paid account.

   ```bash
   cp .env.example .env
   # then edit .env and set GROQ_API_KEY=gsk_...
   ```

   If `GROQ_API_KEY` is not set, `ai-validation.spec.ts` is **automatically
   skipped** — the rest of the suite still runs and passes normally.

## Running the Tests

```bash
npm test                 # run the full suite headless
npm run test:headed      # run with a visible browser
npm run test:ui          # Playwright's interactive UI mode (great for debugging)

npm run test:home        # only index.html tests
npm run test:diary       # only dreams-diary.html tests
npm run test:total       # only dreams-total.html tests
npm run test:ai          # only bonus AI validation tests
```

## Reports

**Built-in HTML report** (auto-generated after every run):

```bash
npm run report
```

**Allure report** (richer history/trends, per the assignment's reporting bonus):

```bash
npm run allure:generate
npm run allure:open
```

Screenshots, videos, and traces for **failing** tests are automatically
attached to both reports (see `use.screenshot` / `use.video` / `use.trace` in
`playwright.config.ts`) and stored under `test-results/` (gitignored, local
only).

## Screenshots

The `screenshots/` folder contains evidence from a full passing run, for
submission purposes:

| File | Shows |
|---|---|
| `01-all-tests-passing.png` | Full HTML report — all 13 tests green |
| `02-diary-10-entries.png` | Detail view of the diary "exactly 10 entries" test |
| `03-home-loading-animation.png` | Detail view of the loading-animation timing test |
| `04-ai-validation-output.png` | Bonus AI test output — AI label vs. table label per dream |
| `05-github-collaborator-access.png` | Private repo access shared with `qawingify` |
| `06-github-commit-history.png` | Repo commit history |

## What's Covered

### Part 1 — Core UI Functional Tests

| Page | Coverage |
|---|---|
| `index.html` | Loading animation appears then disappears (~3s); main content + "My Dreams" button become visible; clicking "My Dreams" opens `dreams-diary.html` and `dreams-total.html` in new tabs |
| `dreams-diary.html` | Exactly 10 entries; every Dream Type is "Good" or "Bad"; every row has all 3 columns filled; "Flying over mountains" and "Lost in maze" are confirmed recurring |
| `dreams-total.html` | Good Dreams = 6, Bad Dreams = 4, Total Dreams = 10, Recurring Dreams = 2; recurring count is cross-checked against dreams actually repeated in the diary log |

### Part 2 — Bonus AI Validation

`ai-validation.spec.ts` pulls every dream name from the diary table, sends it
to Groq's Llama 3.1 model with a classification prompt ("Good" or "Bad"), and
asserts the AI's answer matches the type already recorded in the table. Any
disagreement is reported per-dream in the test output/report rather than
failing silently.

## Design Notes / Assumptions

- The live site does not expose `data-testid` attributes, so locators are
  built from visible text/roles (e.g. `getByRole('heading', { name: /dream portal/i })`)
  and standard table structure (`table tbody tr > td`). **All selectors live
  inside the Page Objects**, so if the site's markup changes, only the
  relevant Page Object needs updating — not the tests themselves.
- Page navigation uses relative paths (e.g. `dreams-total.html`, no leading
  slash) so they resolve correctly against the `baseURL`'s subdirectory
  (`https://arjitnigam.github.io/myDreams/`) instead of the domain root.
- `DreamsTotalPage` reads each stat via a resilient "label near a number"
  regex (`BasePage.getStatByLabel`) instead of a brittle CSS/id selector,
  since the summary page doesn't expose stable ids. If the real page later
  exposes ids (e.g. `#goodDreamsCount`), swap those in for slightly
  faster/more precise locators.
- `HomePage.open()` navigates with `waitUntil: 'commit'` rather than the
  default full page load, so the test can catch the loading animation while
  it's still visible instead of arriving after it's already disappeared.
- The "opens two new tabs" behavior in `home.spec.ts` uses `expect.soft()` for
  the two tab-URL checks so a test run clearly reports *which* of the two
  expected tabs did or didn't open, instead of stopping at the first failure.
- Tests run against the **live GitHub Pages URL** by default (`baseURL` in
  `playwright.config.ts`); no local server/mocking is required.

## CI

`.github/workflows/tests.yml` runs the full suite (Part 1 tests always; Part 2
if `GROQ_API_KEY` is added as a repo secret) on every push/PR to `main`, and
uploads the HTML report as a build artifact.

## Evaluation Checklist (per assignment rubric)

- [x] Test Coverage — all Part 1 requirements automated, 13/13 passing
- [x] Code Structure — Page Object Model, typed, no logic duplicated in specs
- [x] Reporting & Logging — HTML report + Allure + screenshots/video/trace on failure
- [x] AI Integration (bonus) — Groq/Llama-based dream classification with per-item comparison
- [x] Clean commits — see Git history
- [x] Bonus — README, CI workflow, screenshots folder, auto-skip for missing API key so the core suite never blocks on the optional bonus
