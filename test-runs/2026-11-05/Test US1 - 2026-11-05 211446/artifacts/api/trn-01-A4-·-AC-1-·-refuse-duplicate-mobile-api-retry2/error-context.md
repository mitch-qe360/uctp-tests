# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/trn-01.spec.ts >> A4 · AC-1 · refuse duplicate mobile
- Location: tests/api/trn-01.spec.ts:36:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 422
```

# Test source

```ts
  1   | // file: tests/api/trn-01.spec.ts
  2   | import { test, expect } from '@playwright/test';
  3   | 
  4   | const baseHeaders = {
  5   |   'X-Tenant-ID': 'TAGAYTAY',
  6   |   'X-User-ID': 'Mitch-6973',
  7   |   'Content-Type': 'application/json',
  8   | };
  9   | 
  10  | const unique = () => Math.random().toString(36).slice(2, 6);
  11  | const mobile = () =>
  12  |   '09' + String(Date.now()).slice(-9);
  13  | 
  14  | const taxpayer = (overrides = {}) => ({
  15  |   full_name: `Ana ${unique()} Dela Cruz`,
  16  |   mobile: mobile(),
  17  |   ...overrides,
  18  | });
  19  | 
  20  | async function create(request: any, data: any) {
  21  |   return request.post('/api/v1/training/taxpayers', {
  22  |     headers: baseHeaders,
  23  |     data,
  24  |   });
  25  | }
  26  | 
  27  | test('A1 · AC-1 · create taxpayer with unique name and mobile', async ({ request }) => {
  28  |   const data = taxpayer();
  29  |   const response = await create(request, data);
  30  | 
  31  |   expect(response.status()).toBe(201);
  32  |   const body = await response.json();
  33  |   expect(body.taxpayer_id).toBeTruthy();
  34  | });
  35  | 
  36  | test('A4 · AC-1 · refuse duplicate mobile', async ({ request }) => {
  37  |   const data = taxpayer();
  38  |   const first = await create(request, data);
> 39  |   expect(first.status()).toBe(201);
      |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  40  | 
  41  |   const second = await create(request, {
  42  |     ...taxpayer(),
  43  |     mobile: data.mobile,
  44  |   });
  45  | 
  46  |   expect(second.status()).toBe(409);
  47  |   expect(await second.json()).toEqual({
  48  |     detail: { mobile: 'already registered for this tenant' },
  49  |   });
  50  | });
  51  | 
  52  | test.fixme('A2 · AC-1 · ASK: required-field behavior for empty full_name', async () => {});
  53  | 
  54  | test.fixme('A3 · AC-1 · ASK: required-field behavior for empty mobile', async () => {});
  55  | 
  56  | test.fixme('A5 · AC-2 · ASK: GET status code and response schema', async () => {});
  57  | 
  58  | test.fixme('A6 · AC-2 · ASK: exact empty taxpayer-list API response', async () => {});
  59  | 
  60  | test.fixme('A7 · AC-3 · ASK: exact stored full_name in GET response', async () => {});
  61  | 
  62  | test('A8 · AC-4 · refuse mobile already registered for TAGAYTAY', async ({ request }) => {
  63  |   const data = taxpayer();
  64  |   const first = await create(request, data);
  65  |   expect(first.status()).toBe(201);
  66  | 
  67  |   const second = await create(request, {
  68  |     ...taxpayer(),
  69  |     mobile: data.mobile,
  70  |   });
  71  | 
  72  |   expect(second.status()).toBe(409);
  73  |   expect(await second.json()).toEqual({
  74  |     detail: { mobile: 'already registered for this tenant' },
  75  |   });
  76  | });
  77  | 
  78  | test('A9 · AC-4 · refuse a second registration using the same mobile', async ({ request }) => {
  79  |   const data = taxpayer();
  80  |   await create(request, data);
  81  | 
  82  |   const response = await create(request, {
  83  |     ...taxpayer(),
  84  |     mobile: data.mobile,
  85  |   });
  86  | 
  87  |   expect(response.status()).toBe(409);
  88  |   expect(await response.json()).toEqual({
  89  |     detail: { mobile: 'already registered for this tenant' },
  90  |   });
  91  | });
  92  | 
  93  | test.fixme('A10 · AC-4 · ASK: duplicate detection for 09 and +639 representations', async () => {});
  94  | 
  95  | test.fixme('A11 · AC-4 · ASK: exact persistence behavior after duplicate submission', async () => {});
  96  | 
  97  | test('A12 · AC-5 · accept a two-character permitted name', async ({ request }) => {
  98  |   const response = await create(request, {
  99  |     full_name: 'Ña',
  100 |     mobile: mobile(),
  101 |   });
  102 | 
  103 |   expect(response.status()).toBe(201);
  104 |   expect((await response.json()).taxpayer_id).toBeTruthy();
  105 | });
  106 | 
  107 | test('A13 · AC-5 · refuse the one-character name "A"', async ({ request }) => {
  108 |   const response = await create(request, {
  109 |     full_name: 'A',
  110 |     mobile: mobile(),
  111 |   });
  112 | 
  113 |   expect(response.status()).toBe(422);
  114 |   expect(await response.json()).toEqual({
  115 |     detail: {
  116 |       full_name: "2-100 characters: letters, spaces, . - ' and Ñ only",
  117 |     },
  118 |   });
  119 | });
  120 | 
  121 | test('A14 · AC-5 · refuse a 101-character name', async ({ request }) => {
  122 |   const response = await create(request, {
  123 |     full_name: 'A'.repeat(101),
  124 |     mobile: mobile(),
  125 |   });
  126 | 
  127 |   expect(response.status()).toBe(422);
  128 |   expect(await response.json()).toEqual({
  129 |     detail: {
  130 |       full_name: "2-100 characters: letters, spaces, . - ' and Ñ only",
  131 |     },
  132 |   });
  133 | });
  134 | 
  135 | test('A15 · AC-5 · refuse a name containing @', async ({ request }) => {
  136 |   const response = await create(request, {
  137 |     full_name: 'Ana@Test',
  138 |     mobile: mobile(),
  139 |   });
```