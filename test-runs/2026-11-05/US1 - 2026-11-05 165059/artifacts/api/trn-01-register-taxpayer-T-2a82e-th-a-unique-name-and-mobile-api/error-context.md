# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/trn-01-register-taxpayer.spec.ts >> TRN-01 · Register a taxpayer · API >> A1 · AC-1 · create taxpayer with a unique name and mobile
- Location: tests/api/trn-01-register-taxpayer.spec.ts:51:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 422
```

# Test source

```ts
  1   | // file: tests/api/trn-01-register-taxpayer.spec.ts
  2   | import { test, expect, APIRequestContext } from '@playwright/test';
  3   | 
  4   | const tenant = 'TAGAYTAY';
  5   | const tag = 'Mitch-6973';
  6   | let sequence = 0;
  7   | 
  8   | function uniqueData() {
  9   |   sequence++;
  10  |   const suffix = `${Date.now()}${sequence}`.slice(-9);
  11  |   const letters = Math.random().toString(36).slice(2, 6).toUpperCase();
  12  | 
  13  |   return {
  14  |     full_name: `Ana ${letters} Dela Cruz`,
  15  |     mobile: `09${suffix}`,
  16  |   };
  17  | }
  18  | 
  19  | function headers(user = tag) {
  20  |   return {
  21  |     'X-Tenant-ID': tenant,
  22  |     'X-User-ID': user,
  23  |     'Content-Type': 'application/json',
  24  |   };
  25  | }
  26  | 
  27  | async function create(
  28  |   request: APIRequestContext,
  29  |   data: Record<string, unknown>,
  30  |   user = tag,
  31  | ) {
  32  |   return request.post('/api/v1/training/taxpayers', {
  33  |     headers: headers(user),
  34  |     data,
  35  |   });
  36  | }
  37  | 
  38  | async function list(request: APIRequestContext, user = tag) {
  39  |   return request.get('/api/v1/training/taxpayers', {
  40  |     headers: headers(user),
  41  |   });
  42  | }
  43  | 
  44  | const nameError =
  45  |   "2-100 characters: letters, spaces, . - ' and Ñ only";
  46  | const mobileError =
  47  |   'must be a PH mobile 09XXXXXXXXX or +639XXXXXXXXX';
  48  | const emailError = 'invalid email format';
  49  | 
  50  | test.describe('TRN-01 · Register a taxpayer · API', () => {
  51  |   test('A1 · AC-1 · create taxpayer with a unique name and mobile', async ({ request }) => {
  52  |     const data = uniqueData();
  53  |     const response = await create(request, data);
  54  | 
> 55  |     expect(response.status()).toBe(201);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  56  |     const body = await response.json();
  57  |     expect(body.taxpayer_id).toBeTruthy();
  58  |   });
  59  | 
  60  |   test('A2 · AC-1 · refuse missing full_name', async ({ request }) => {
  61  |     const response = await create(request, {
  62  |       mobile: uniqueData().mobile,
  63  |     });
  64  | 
  65  |     expect(response.status()).toBe(422);
  66  |     const body = await response.json();
  67  |     expect(body.detail.full_name).toBeTruthy();
  68  |   });
  69  | 
  70  |   test('A3 · AC-1 · refuse missing mobile', async ({ request }) => {
  71  |     const response = await create(request, {
  72  |       full_name: uniqueData().full_name,
  73  |     });
  74  | 
  75  |     expect(response.status()).toBe(422);
  76  |     const body = await response.json();
  77  |     expect(body.detail.mobile).toBeTruthy();
  78  |   });
  79  | 
  80  |   test('A4 · AC-1 · refuse an empty JSON body', async ({ request }) => {
  81  |     const response = await create(request, {});
  82  | 
  83  |     expect(response.status()).toBe(422);
  84  |   });
  85  | 
  86  |   test('A5 · AC-2 · retrieve the taxpayer created under Mitch-6973', async ({ request }) => {
  87  |     const data = uniqueData();
  88  |     const created = await create(request, data);
  89  | 
  90  |     expect(created.status()).toBe(201);
  91  |     const createdBody = await created.json();
  92  | 
  93  |     const response = await list(request);
  94  |     expect(response.status()).toBe(200);
  95  | 
  96  |     const body = await response.json();
  97  |     const taxpayer = body.find(
  98  |       (item: any) => item.taxpayer_id === createdBody.taxpayer_id,
  99  |     );
  100 | 
  101 |     expect(taxpayer.full_name).toBe(data.full_name);
  102 |     expect(taxpayer.mobile).toBe(data.mobile);
  103 |   });
  104 | 
  105 |   test('A6 · AC-2 · exclude taxpayer from a different name-tag list', async ({ request }) => {
  106 |     const data = uniqueData();
  107 |     await create(request, data);
  108 | 
  109 |     const response = await list(request, `${tag}-other`);
  110 |     expect(response.status()).toBe(200);
  111 | 
  112 |     const body = await response.json();
  113 |     expect(body.some((item: any) => item.mobile === data.mobile)).toBe(false);
  114 |   });
  115 | 
  116 |   test('A7 · AC-2 · exclude a taxpayer belonging to another tenant', async ({ request }) => {
  117 |     const data = uniqueData();
  118 |     await create(request, data);
  119 | 
  120 |     const response = await request.get('/api/v1/training/taxpayers', {
  121 |       headers: {
  122 |         'X-Tenant-ID': 'OTHER-TENANT',
  123 |         'X-User-ID': tag,
  124 |       },
  125 |     });
  126 | 
  127 |     expect(response.status()).toBe(200);
  128 |     const body = await response.json();
  129 |     expect(body.some((item: any) => item.mobile === data.mobile)).toBe(false);
  130 |   });
  131 | 
  132 |   test.skip('A8 · AC-2 · retrieve taxpayers without X-User-ID', async ({ request }) => {
  133 |     // ASK: Expected status code and response detail are not specified.
  134 |   });
  135 | 
  136 |   test('A9 · AC-3 · trim leading and trailing name spaces before storage', async ({ request }) => {
  137 |     const data = uniqueData();
  138 |     const submittedName = `  ${data.full_name}  `;
  139 | 
  140 |     const response = await create(request, {
  141 |       ...data,
  142 |       full_name: submittedName,
  143 |     });
  144 | 
  145 |     expect(response.status()).toBe(201);
  146 | 
  147 |     const body = await response.json();
  148 |     const responseList = await list(request);
  149 |     const taxpayers = await responseList.json();
  150 | 
  151 |     const saved = taxpayers.find(
  152 |       (item: any) => item.taxpayer_id === body.taxpayer_id,
  153 |     );
  154 | 
  155 |     expect(saved.full_name).toBe(data.full_name);
```