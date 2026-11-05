# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web/trn-01.spec.ts >> W1 · AC-1 · show created message for a unique taxpayer
- Location: tests/web/trn-01.spec.ts:22:5

# Error details

```
Error: locator.click: Error: strict mode violation: getByText('Training setup') resolved to 2 elements:
    1) <a class="" href="/training" data-nav="training">Training setup</a> aka getByRole('link', { name: 'Training setup' })
    2) <h2>Training setup</h2> aka getByRole('heading', { name: 'Training setup' })

Call log:
  - waiting for getByText('Training setup')

```

# Test source

```ts
  1   | // file: tests/web/trn-01.spec.ts
  2   | import { test, expect, signIn } from '../../helpers/web';
  3   | 
  4   | const unique = () => Array.from({ length: 4 }, () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]).join('');
  5   | const mobile = () => '09' + String(Date.now()).slice(-9);
  6   | const name = () => `Ana ${unique()} Dela Cruz`;
  7   | 
  8   | async function setup(page: any, nameTag = 'Mitch-6973') {
  9   |   await signIn(page, nameTag);
  10  | }
  11  | 
  12  | async function openCreate(page: any) {
> 13  |   await page.getByText('Training setup').click();
      |                                          ^ Error: locator.click: Error: strict mode violation: getByText('Training setup') resolved to 2 elements:
  14  |   await page.getByText('Create my data').click();
  15  | }
  16  | 
  17  | async function openMyTaxpayers(page: any) {
  18  |   await page.getByText('My data').click();
  19  |   await page.getByText('My taxpayers').click();
  20  | }
  21  | 
  22  | test('W1 · AC-1 · show created message for a unique taxpayer', async ({ page }) => {
  23  |   const fullName = name();
  24  |   const phone = mobile();
  25  | 
  26  |   await setup(page);
  27  |   await openCreate(page);
  28  | 
  29  |   await page.getByLabel('Full name').fill(fullName);
  30  |   await page.getByLabel('Mobile (09XXXXXXXXX)').fill(phone);
  31  |   await page.getByRole('button', { name: 'Create taxpayer' }).click();
  32  | 
  33  |   await expect(page.getByText(
  34  |     `${fullName} created — mobile ${phone}.`,
  35  |     { exact: true }
  36  |   )).toBeVisible();
  37  | });
  38  | 
  39  | test.fixme('W3 · AC-2 · ASK: exact empty-list screen state before taxpayer creation', async () => {});
  40  | 
  41  | test.fixme('W4 · AC-3 · ASK: whether internal repeated spaces are preserved', async () => {});
  42  | 
  43  | test.fixme('W5 · AC-3 · ASK: exact name persistence after page reload', async () => {});
  44  | 
  45  | test.fixme('W6 · AC-4 · ASK: exact screen presentation for duplicate mobile', async () => {});
  46  | 
  47  | test('W7 · AC-5 · refuse a one-character name', async ({ page }) => {
  48  |   await setup(page);
  49  |   await openCreate(page);
  50  | 
  51  |   await page.getByLabel('Full name').fill('A');
  52  |   await page.getByLabel('Mobile (09XXXXXXXXX)').fill(mobile());
  53  |   await page.getByRole('button', { name: 'Create taxpayer' }).click();
  54  | 
  55  |   await expect(page.getByText(
  56  |     "2-100 characters: letters, spaces, . - ' and Ñ only"
  57  |   )).toBeVisible();
  58  | });
  59  | 
  60  | test.fixme('W8 · AC-5 · ASK: exact form behavior for a name containing @', async () => {});
  61  | 
  62  | test.fixme('W9 · AC-6 · ASK: exact screen behavior for an email without a dot after @', async () => {});
  63  | 
  64  | test('W10 · AC-7 · show taxpayer under Mitch-6973', async ({ page }) => {
  65  |   const fullName = name();
  66  |   const phone = mobile();
  67  | 
  68  |   await setup(page, 'Mitch-6973');
  69  |   await openCreate(page);
  70  | 
  71  |   await page.getByLabel('Full name').fill(fullName);
  72  |   await page.getByLabel('Mobile (09XXXXXXXXX)').fill(phone);
  73  |   await page.getByRole('button', { name: 'Create taxpayer' }).click();
  74  | 
  75  |   await openMyTaxpayers(page);
  76  | 
  77  |   await expect(page.getByText(fullName, { exact: true })).toBeVisible();
  78  |   await expect(page.getByText(phone, { exact: true })).toBeVisible();
  79  | });
  80  | 
  81  | test('W11 · AC-7 · show empty-data message under Mitch-6973-other', async ({ page }) => {
  82  |   await setup(page, 'Mitch-6973');
  83  | 
  84  |   await openCreate(page);
  85  |   await page.getByLabel('Full name').fill(name());
  86  |   await page.getByLabel('Mobile (09XXXXXXXXX)').fill(mobile());
  87  |   await page.getByRole('button', { name: 'Create taxpayer' }).click();
  88  | 
  89  |   await page.getByText('Change', { exact: true }).click();
  90  |   await page.getByRole('textbox').fill('Mitch-6973-other');
  91  |   await page.getByRole('button', { name: 'Save' }).click();
  92  | 
  93  |   await page.getByText('My data').click();
  94  | 
  95  |   await expect(page.getByText(
  96  |     'None yet — create one in Training setup.',
  97  |     { exact: true }
  98  |   )).toBeVisible();
  99  | });
  100 | 
  101 | test('W12 · AC-7 · show empty taxpayer lists under Mitch-6973-other', async ({ page }) => {
  102 |   await setup(page, 'Mitch-6973');
  103 | 
  104 |   await openCreate(page);
  105 |   await page.getByLabel('Full name').fill(name());
  106 |   await page.getByLabel('Mobile (09XXXXXXXXX)').fill(mobile());
  107 |   await page.getByRole('button', { name: 'Create taxpayer' }).click();
  108 | 
  109 |   await page.getByText('Change', { exact: true }).click();
  110 |   await page.getByRole('textbox').fill('Mitch-6973-other');
  111 |   await page.getByRole('button', { name: 'Save' }).click();
  112 | 
  113 |   await openMyTaxpayers(page);
```