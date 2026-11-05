# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: integration/trn-01-register-taxpayer.spec.ts >> TRN-01 · Register a taxpayer · Integration >> I2 · AC-3 · compare trimmed screen name with trimmed API name
- Location: tests/integration/trn-01-register-taxpayer.spec.ts:77:7

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
  1   | // file: tests/integration/trn-01-register-taxpayer.spec.ts
  2   | import { test, expect, Page } from '@playwright/test';
  3   | 
  4   | const tag = 'Mitch-6973';
  5   | let sequence = 0;
  6   | 
  7   | function uniqueData() {
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
  18  | const apiHeaders = (user = tag) => ({
  19  |   'X-Tenant-ID': 'TAGAYTAY',
  20  |   'X-User-ID': user,
  21  | });
  22  | 
  23  | async function setup(page: Page, nameTag = tag) {
  24  |   await page.goto('/');
> 25  |   await page.getByLabel('Your name').fill(nameTag);
      |                                      ^ Error: locator.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] and does not have a role allowing [aria-readonly]
  26  |   await page.getByRole('button', { name: 'Save' }).click();
  27  | }
  28  | 
  29  | async function createOnScreen(
  30  |   page: Page,
  31  |   name: string,
  32  |   mobile: string,
  33  | ) {
  34  |   await page.getByText('Create my data').click();
  35  |   await page.getByLabel('Full name').fill(name);
  36  |   await page.getByLabel('Mobile (09XXXXXXXXX)').fill(mobile);
  37  |   await page.getByRole('button', { name: 'Create taxpayer' }).click();
  38  | }
  39  | 
  40  | async function getMyTaxpayers(request: any, nameTag = tag) {
  41  |   return request.get('/api/v1/training/taxpayers', {
  42  |     headers: apiHeaders(nameTag),
  43  |   });
  44  | }
  45  | 
  46  | test.describe('TRN-01 · Register a taxpayer · Integration', () => {
  47  |   test('I1 · AC-2 · compare created screen details with stored API details', async ({ page, request }) => {
  48  |     const d = uniqueData();
  49  | 
  50  |     await setup(page);
  51  |     await createOnScreen(page, d.name, d.mobile);
  52  | 
  53  |     await expect(page.getByText(
  54  |       `${d.name} created — mobile ${d.mobile}.`,
  55  |       { exact: true },
  56  |     )).toBeVisible();
  57  | 
  58  |     const response = await getMyTaxpayers(request);
  59  |     expect(response.status()).toBe(200);
  60  | 
  61  |     const body = await response.json();
  62  |     const saved = body.find(
  63  |       (item: any) =>
  64  |         item.full_name === d.name &&
  65  |         item.mobile === d.mobile,
  66  |     );
  67  | 
  68  |     expect(saved).toBeTruthy();
  69  | 
  70  |     await page.getByText('My data').click();
  71  |     await page.getByText('My taxpayers').click();
  72  | 
  73  |     await expect(page.getByText(d.name, { exact: true })).toBeVisible();
  74  |     await expect(page.getByText(d.mobile, { exact: true })).toBeVisible();
  75  |   });
  76  | 
  77  |   test('I2 · AC-3 · compare trimmed screen name with trimmed API name', async ({ page, request }) => {
  78  |     const d = uniqueData();
  79  | 
  80  |     await setup(page);
  81  |     await createOnScreen(page, `  ${d.name}  `, d.mobile);
  82  | 
  83  |     await expect(page.getByText(
  84  |       `${d.name} created — mobile ${d.mobile}.`,
  85  |       { exact: true },
  86  |     )).toBeVisible();
  87  | 
  88  |     const response = await getMyTaxpayers(request);
  89  |     expect(response.status()).toBe(200);
  90  | 
  91  |     const body = await response.json();
  92  |     const saved = body.find(
  93  |       (item: any) => item.mobile === d.mobile,
  94  |     );
  95  | 
  96  |     expect(saved.full_name).toBe(d.name);
  97  |     expect(saved.full_name.startsWith(' ')).toBe(false);
  98  |     expect(saved.full_name.endsWith(' ')).toBe(false);
  99  | 
  100 |     await page.getByText('My data').click();
  101 |     await page.getByText('My taxpayers').click();
  102 | 
  103 |     await expect(page.getByText(d.name, { exact: true })).toBeVisible();
  104 |   });
  105 | 
  106 |   test('I3 · AC-7 · compare taxpayer visibility across two name-tags', async ({ page, request }) => {
  107 |     const d = uniqueData();
  108 | 
  109 |     await setup(page);
  110 |     await createOnScreen(page, d.name, d.mobile);
  111 | 
  112 |     const ownList = await getMyTaxpayers(request, tag);
  113 |     expect(ownList.status()).toBe(200);
  114 | 
  115 |     const ownBody = await ownList.json();
  116 |     expect(ownBody.some(
  117 |       (item: any) => item.mobile === d.mobile,
  118 |     )).toBe(true);
  119 | 
  120 |     await page.getByText('Change').click();
  121 |     await page.getByLabel('Your name').fill(`${tag}-other`);
  122 |     await page.getByRole('button', { name: 'Save' }).click();
  123 | 
  124 |     const otherList = await getMyTaxpayers(request, `${tag}-other`);
  125 |     expect(otherList.status()).toBe(200);
```