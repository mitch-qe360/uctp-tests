# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web/trn-01-register-taxpayer.spec.ts >> TRN-01 · Register a taxpayer · Web >> W24 · AC-6 · refuse email without at sign
- Location: tests/web/trn-01-register-taxpayer.spec.ts:292:7

# Error details

```
Error: locator.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] and does not have a role allowing [aria-readonly]
Call log:
  - waiting for getByLabel('Your name')
    - locator resolved to <div class="modal" role="dialog" aria-modal="true" aria-label="Your name">…</div>
    - fill("Mitch-6973")
  - attempting fill action
    - waiting for element to be visible, enabled and editable

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
  1   | // file: tests/web/trn-01-register-taxpayer.spec.ts
  2   | import { test, expect, Page } from '@playwright/test';
  3   | 
  4   | const tag = 'Mitch-6973';
  5   | let sequence = 0;
  6   | 
  7   | function data() {
  8   |   sequence++;
  9   |   const suffix = `${Date.now()}${sequence}`.slice(-9);
  10  |   const letters = Math.random().toString(36).slice(2, 6).toUpperCase();
  11  | 
  12  |   return {
  13  |     name: `Ana ${letters} Dela Cruz`,
  14  |     mobile: `09${suffix}`,
  15  |   };
  16  | }
  17  | 
  18  | async function enterApplication(page: Page, nameTag = tag) {
  19  |   await page.goto('/');
  20  | 
  21  |   const nameBox = page.getByLabel('Your name');
  22  |   await expect(nameBox).toBeVisible();
> 23  |   await nameBox.fill(nameTag);
      |                 ^ Error: locator.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] and does not have a role allowing [aria-readonly]
  24  |   await page.getByRole('button', { name: 'Save' }).click();
  25  | 
  26  |   await expect(
  27  |     page.getByText('Create my data'),
  28  |   ).toBeVisible();
  29  | }
  30  | 
  31  | async function openCreate(page: Page) {
  32  |   await page.getByText('Create my data').click();
  33  |   await expect(page.getByLabel('Full name')).toBeVisible();
  34  | }
  35  | 
  36  | async function submitTaxpayer(
  37  |   page: Page,
  38  |   name: string,
  39  |   mobile: string,
  40  |   email?: string,
  41  | ) {
  42  |   await page.getByLabel('Full name').fill(name);
  43  |   await page.getByLabel('Mobile (09XXXXXXXXX)').fill(mobile);
  44  | 
  45  |   if (email !== undefined) {
  46  |     await page.getByLabel('Email (optional)').fill(email);
  47  |   }
  48  | 
  49  |   await page.getByRole('button', { name: 'Create taxpayer' }).click();
  50  | }
  51  | 
  52  | async function openMyTaxpayers(page: Page) {
  53  |   await page.getByText('My data').click();
  54  |   await page.getByText('My taxpayers').click();
  55  | }
  56  | 
  57  | test.describe('TRN-01 · Register a taxpayer · Web', () => {
  58  |   test('W1 · AC-1 · display created name and mobile', async ({ page }) => {
  59  |     const d = data();
  60  |     await enterApplication(page);
  61  |     await openCreate(page);
  62  |     await submitTaxpayer(page, d.name, d.mobile);
  63  | 
  64  |     await expect(page.getByText(
  65  |       `${d.name} created — mobile ${d.mobile}.`,
  66  |       { exact: true },
  67  |     )).toBeVisible();
  68  |   });
  69  | 
  70  |   test.skip('W2 · AC-1 · refuse missing Full name', async () => {
  71  |     // ASK: Exact missing-name field message is not specified.
  72  |   });
  73  | 
  74  |   test.skip('W3 · AC-1 · refuse missing Mobile', async () => {
  75  |     // ASK: Exact missing-mobile field message is not specified.
  76  |   });
  77  | 
  78  |   test.skip('W4 · AC-1 · refuse submission with both fields empty', async () => {
  79  |     // ASK: Exact form feedback is not specified.
  80  |   });
  81  | 
  82  |   test('W5 · AC-2 · show the created taxpayer in My taxpayers', async ({ page }) => {
  83  |     const d = data();
  84  |     await enterApplication(page);
  85  |     await openCreate(page);
  86  |     await submitTaxpayer(page, d.name, d.mobile);
  87  |     await openMyTaxpayers(page);
  88  | 
  89  |     await expect(page.getByText(d.name, { exact: true })).toBeVisible();
  90  |     await expect(page.getByText(d.mobile, { exact: true })).toBeVisible();
  91  |   });
  92  | 
  93  |   test('W6 · AC-2 · keep an unsubmitted taxpayer out of My taxpayers', async ({ page }) => {
  94  |     const d = data();
  95  |     await enterApplication(page);
  96  |     await openCreate(page);
  97  | 
  98  |     await page.getByLabel('Full name').fill(d.name);
  99  |     await page.getByLabel('Mobile (09XXXXXXXXX)').fill(d.mobile);
  100 |     await openMyTaxpayers(page);
  101 | 
  102 |     await expect(page.getByText(d.name, { exact: true })).toHaveCount(0);
  103 |   });
  104 | 
  105 |   test.skip('W7 · AC-2 · show empty-state before taxpayer creation', async () => {
  106 |     // ASK: Exact initial empty-state text is not specified.
  107 |   });
  108 | 
  109 |   test('W8 · AC-2 · hide taxpayer when another name-tag is used', async ({ page }) => {
  110 |     const d = data();
  111 |     await enterApplication(page);
  112 |     await openCreate(page);
  113 |     await submitTaxpayer(page, d.name, d.mobile);
  114 | 
  115 |     await page.getByText('Change').click();
  116 |     await page.getByLabel('Your name').fill(`${tag}-other`);
  117 |     await page.getByRole('button', { name: 'Save' }).click();
  118 | 
  119 |     await openMyTaxpayers(page);
  120 |     await expect(page.getByText(d.name, { exact: true })).toHaveCount(0);
  121 |   });
  122 | 
  123 |   test('W9 · AC-3 · remove spaces around name in both displays', async ({ page }) => {
```