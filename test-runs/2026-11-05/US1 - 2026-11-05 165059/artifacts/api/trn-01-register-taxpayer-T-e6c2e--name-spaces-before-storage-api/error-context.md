# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/trn-01-register-taxpayer.spec.ts >> TRN-01 · Register a taxpayer · API >> A9 · AC-3 · trim leading and trailing name spaces before storage
- Location: tests/api/trn-01-register-taxpayer.spec.ts:136:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 422
```

# Test source

```ts
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
  55  |     expect(response.status()).toBe(201);
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
> 145 |     expect(response.status()).toBe(201);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
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
  156 |   });
  157 | 
  158 |   test.skip('A10 · AC-3 · refuse a name containing only spaces', async ({ request }) => {
  159 |     // ASK: Exact behavior for whitespace-only name is not established.
  160 |   });
  161 | 
  162 |   test('A11 · AC-3 · refuse a one-character name', async ({ request }) => {
  163 |     const response = await create(request, {
  164 |       full_name: 'A',
  165 |       mobile: uniqueData().mobile,
  166 |     });
  167 | 
  168 |     expect(response.status()).toBe(422);
  169 |     expect((await response.json()).detail.full_name).toBe(nameError);
  170 |   });
  171 | 
  172 |   test('A12 · AC-3 · refuse a 101-character name', async ({ request }) => {
  173 |     const response = await create(request, {
  174 |       full_name: 'A'.repeat(101),
  175 |       mobile: uniqueData().mobile,
  176 |     });
  177 | 
  178 |     expect(response.status()).toBe(422);
  179 |     expect((await response.json()).detail.full_name).toBe(nameError);
  180 |   });
  181 | 
  182 |   test('A13 · AC-4 · create taxpayer using an unregistered mobile', async ({ request }) => {
  183 |     const response = await create(request, uniqueData());
  184 | 
  185 |     expect(response.status()).toBe(201);
  186 |     expect((await response.json()).taxpayer_id).toBeTruthy();
  187 |   });
  188 | 
  189 |   test('A14 · AC-4 · refuse reuse of an already registered mobile', async ({ request }) => {
  190 |     const data = uniqueData();
  191 |     expect((await create(request, data)).status()).toBe(201);
  192 | 
  193 |     const response = await create(request, {
  194 |       ...data,
  195 |       full_name: uniqueData().full_name,
  196 |     });
  197 | 
  198 |     expect(response.status()).toBe(409);
  199 |     expect((await response.json()).detail.mobile)
  200 |       .toBe('already registered for this tenant');
  201 |   });
  202 | 
  203 |   test('A15 · AC-4 · refuse duplicate mobile with a different taxpayer name', async ({ request }) => {
  204 |     const data = uniqueData();
  205 |     await create(request, data);
  206 | 
  207 |     const response = await create(request, {
  208 |       full_name: 'Maria Santos',
  209 |       mobile: data.mobile,
  210 |     });
  211 | 
  212 |     expect(response.status()).toBe(409);
  213 |     expect((await response.json()).detail.mobile)
  214 |       .toBe('already registered for this tenant');
  215 |   });
  216 | 
  217 |   test.skip('A16 · AC-4 · check duplicate mobile under another name-tag', async ({ request }) => {
  218 |     // ASK: Confirm whether duplicate mobile registration is tenant-wide
  219 |     // or isolated by name-tag.
  220 |   });
  221 | 
  222 |   test('A17 · AC-5 · accept a two-character alphabetic name', async ({ request }) => {
  223 |     const response = await create(request, {
  224 |       full_name: 'Jo',
  225 |       mobile: uniqueData().mobile,
  226 |     });
  227 | 
  228 |     expect(response.status()).toBe(201);
  229 |     expect((await response.json()).taxpayer_id).toBeTruthy();
  230 |   });
  231 | 
  232 |   test('A18 · AC-5 · refuse a one-character name', async ({ request }) => {
  233 |     const response = await create(request, {
  234 |       full_name: 'J',
  235 |       mobile: uniqueData().mobile,
  236 |     });
  237 | 
  238 |     expect(response.status()).toBe(422);
  239 |     expect((await response.json()).detail.full_name).toBe(nameError);
  240 |   });
  241 | 
  242 |   test('A19 · AC-5 · refuse a 101-character name', async ({ request }) => {
  243 |     const response = await create(request, {
  244 |       full_name: 'A'.repeat(101),
  245 |       mobile: uniqueData().mobile,
```