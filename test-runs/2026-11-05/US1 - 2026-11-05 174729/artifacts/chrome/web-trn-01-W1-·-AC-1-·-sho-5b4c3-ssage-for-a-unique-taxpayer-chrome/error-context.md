# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web/trn-01.spec.ts >> W1 · AC-1 · show created message for a unique taxpayer
- Location: tests/web/trn-01.spec.ts:28:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Your name')
Expected: visible
Error: strict mode violation: getByText('Your name') resolved to 2 elements:
    1) <a href="#" @click.prevent="askName()">set your name</a> aka getByRole('link', { name: 'set your name' })
    2) <h2>Your name</h2> aka getByRole('heading', { name: 'Your name' })

Call log:
  - Expect "toBeVisible" getByText('Your name') with timeout 5000ms
  - waiting for getByText('Your name')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - note [ref=e2]: TRAINING — made-up data only
  - navigation "Main" [ref=e3]:
    - link "UCTP" [ref=e4] [cursor=pointer]:
      - /url: /
    - generic [ref=e5]:
      - link "Home" [ref=e6] [cursor=pointer]:
        - /url: /
      - link "Training setup" [ref=e7] [cursor=pointer]:
        - /url: /training
      - link "Teller POS" [ref=e8] [cursor=pointer]:
        - /url: /pos
      - link "Citizen portal" [ref=e9] [cursor=pointer]:
        - /url: /portal
      - link "Simulator" [ref=e10] [cursor=pointer]:
        - /url: /simulator
      - link "My data" [ref=e11] [cursor=pointer]:
        - /url: /my-data
      - link "API docs" [ref=e12] [cursor=pointer]:
        - /url: /docs
    - generic [ref=e14]:
      - text: not identified —
      - link "set your name" [ref=e15] [cursor=pointer]:
        - /url: "#"
  - dialog "Your name" [ref=e17]:
    - heading "Your name" [level=2] [ref=e18]
    - paragraph [ref=e19]:
      - text: Used to label your training data. 2–60 characters. Type
      - code [ref=e20]: Name-1234
      - text: to continue your existing data from another browser.
    - textbox "e.g. Ana" [ref=e21]
    - button "Save" [ref=e22] [cursor=pointer]
  - main [ref=e23]:
    - heading "Unified City Treasury Platform — Tagaytay pilot" [level=1] [ref=e24]
    - paragraph [ref=e25]: Every flow starts here. Pick a role; each screen hands off to the next step.
    - generic [ref=e26]:
      - generic [ref=e27]:
        - heading "Training setup" [level=2] [ref=e28]
        - paragraph [ref=e29]: Create the taxpayers, bills, and teller booklets you will use in class.
        - link [ref=e30] [cursor=pointer]:
          - /url: /training
          - button "Create my data" [ref=e31]
      - generic [ref=e32]:
        - 'heading "Teller: POS" [level=2] [ref=e33]'
        - paragraph [ref=e34]: Counter cashiering — load an Order of Payment, tender cash or cheque, print the OR.
        - link [ref=e35] [cursor=pointer]:
          - /url: /pos
          - button "Open POS" [ref=e36]
      - generic [ref=e37]:
        - 'heading "Citizen: portal" [level=2] [ref=e38]'
        - paragraph [ref=e39]: Taxpayer self-service — look up what you owe and pay online.
        - link [ref=e40] [cursor=pointer]:
          - /url: /portal
          - button "Open portal" [ref=e41]
      - generic [ref=e42]:
        - 'heading "Bank: settlement simulator" [level=2] [ref=e43]'
        - paragraph [ref=e44]: Training tool that drives the real settlement endpoints with a simulated bank reference.
        - link [ref=e45] [cursor=pointer]:
          - /url: /simulator
          - button "Open simulator" [ref=e46]
      - generic [ref=e47]:
        - heading "My data" [level=2] [ref=e48]
        - paragraph [ref=e49]: Everything you created — taxpayers, bills, tellers, receipts — and the next action for each.
        - link [ref=e50] [cursor=pointer]:
          - /url: /my-data
          - button "See my data" [ref=e51]
      - generic [ref=e52]:
        - heading "API docs" [level=2] [ref=e53]
        - paragraph [ref=e54]: OpenAPI / Swagger reference for every endpoint in the platform.
        - link [ref=e55] [cursor=pointer]:
          - /url: /docs
          - button "Open API docs" [ref=e56]
```

# Test source

```ts
  1   | // file: tests/web/trn-01.spec.ts
  2   | import { test, expect } from '@playwright/test';
  3   | 
  4   | const unique = () => Math.random().toString(36).slice(2, 6);
  5   | const mobile = () => '09' + String(Date.now()).slice(-9);
  6   | const name = () => `Ana ${unique()} Dela Cruz`;
  7   | 
  8   | async function setup(page: any, nameTag = 'Mitch-6973') {
  9   |   await page.goto('/');
  10  | 
  11  |   const nameBox = page.getByText('Your name');
> 12  |   await expect(nameBox).toBeVisible();
      |                         ^ Error: expect(locator).toBeVisible() failed
  13  | 
  14  |   await page.getByRole('textbox').first().fill(nameTag);
  15  |   await page.getByRole('button', { name: 'Save' }).click();
  16  | }
  17  | 
  18  | async function openCreate(page: any) {
  19  |   await page.getByText('Training setup').click();
  20  |   await page.getByText('Create my data').click();
  21  | }
  22  | 
  23  | async function openMyTaxpayers(page: any) {
  24  |   await page.getByText('My data').click();
  25  |   await page.getByText('My taxpayers').click();
  26  | }
  27  | 
  28  | test('W1 · AC-1 · show created message for a unique taxpayer', async ({ page }) => {
  29  |   const fullName = name();
  30  |   const phone = mobile();
  31  | 
  32  |   await setup(page);
  33  |   await openCreate(page);
  34  | 
  35  |   await page.getByLabel('Full name').fill(fullName);
  36  |   await page.getByLabel('Mobile (09XXXXXXXXX)').fill(phone);
  37  |   await page.getByRole('button', { name: 'Create taxpayer' }).click();
  38  | 
  39  |   await expect(page.getByText(
  40  |     `${fullName} created — mobile ${phone}.`,
  41  |     { exact: true }
  42  |   )).toBeVisible();
  43  | });
  44  | 
  45  | test.fixme('W3 · AC-2 · ASK: exact empty-list screen state before taxpayer creation', async () => {});
  46  | 
  47  | test.fixme('W4 · AC-3 · ASK: whether internal repeated spaces are preserved', async () => {});
  48  | 
  49  | test.fixme('W5 · AC-3 · ASK: exact name persistence after page reload', async () => {});
  50  | 
  51  | test.fixme('W6 · AC-4 · ASK: exact screen presentation for duplicate mobile', async () => {});
  52  | 
  53  | test('W7 · AC-5 · refuse a one-character name', async ({ page }) => {
  54  |   await setup(page);
  55  |   await openCreate(page);
  56  | 
  57  |   await page.getByLabel('Full name').fill('A');
  58  |   await page.getByLabel('Mobile (09XXXXXXXXX)').fill(mobile());
  59  |   await page.getByRole('button', { name: 'Create taxpayer' }).click();
  60  | 
  61  |   await expect(page.getByText(
  62  |     "2-100 characters: letters, spaces, . - ' and Ñ only"
  63  |   )).toBeVisible();
  64  | });
  65  | 
  66  | test.fixme('W8 · AC-5 · ASK: exact form behavior for a name containing @', async () => {});
  67  | 
  68  | test.fixme('W9 · AC-6 · ASK: exact screen behavior for an email without a dot after @', async () => {});
  69  | 
  70  | test('W10 · AC-7 · show taxpayer under Mitch-6973', async ({ page }) => {
  71  |   const fullName = name();
  72  |   const phone = mobile();
  73  | 
  74  |   await setup(page, 'Mitch-6973');
  75  |   await openCreate(page);
  76  | 
  77  |   await page.getByLabel('Full name').fill(fullName);
  78  |   await page.getByLabel('Mobile (09XXXXXXXXX)').fill(phone);
  79  |   await page.getByRole('button', { name: 'Create taxpayer' }).click();
  80  | 
  81  |   await openMyTaxpayers(page);
  82  | 
  83  |   await expect(page.getByText(fullName, { exact: true })).toBeVisible();
  84  |   await expect(page.getByText(phone, { exact: true })).toBeVisible();
  85  | });
  86  | 
  87  | test('W11 · AC-7 · show empty-data message under Mitch-6973-other', async ({ page }) => {
  88  |   await setup(page, 'Mitch-6973');
  89  | 
  90  |   await openCreate(page);
  91  |   await page.getByLabel('Full name').fill(name());
  92  |   await page.getByLabel('Mobile (09XXXXXXXXX)').fill(mobile());
  93  |   await page.getByRole('button', { name: 'Create taxpayer' }).click();
  94  | 
  95  |   await page.getByText('Change', { exact: true }).click();
  96  |   await page.getByRole('textbox').fill('Mitch-6973-other');
  97  |   await page.getByRole('button', { name: 'Save' }).click();
  98  | 
  99  |   await page.getByText('My data').click();
  100 | 
  101 |   await expect(page.getByText(
  102 |     'None yet — create one in Training setup.',
  103 |     { exact: true }
  104 |   )).toBeVisible();
  105 | });
  106 | 
  107 | test('W12 · AC-7 · show empty taxpayer lists under Mitch-6973-other', async ({ page }) => {
  108 |   await setup(page, 'Mitch-6973');
  109 | 
  110 |   await openCreate(page);
  111 |   await page.getByLabel('Full name').fill(name());
  112 |   await page.getByLabel('Mobile (09XXXXXXXXX)').fill(mobile());
```