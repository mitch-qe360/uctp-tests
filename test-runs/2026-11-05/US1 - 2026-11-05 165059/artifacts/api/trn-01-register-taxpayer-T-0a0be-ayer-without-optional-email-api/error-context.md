# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/trn-01-register-taxpayer.spec.ts >> TRN-01 · Register a taxpayer · API >> A22 · AC-6 · create taxpayer without optional email
- Location: tests/api/trn-01-register-taxpayer.spec.ts:272:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 422
```

# Test source

```ts
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
  246 |     });
  247 | 
  248 |     expect(response.status()).toBe(422);
  249 |     expect((await response.json()).detail.full_name).toBe(nameError);
  250 |   });
  251 | 
  252 |   test('A20 · AC-5 · refuse a name containing an at sign', async ({ request }) => {
  253 |     const response = await create(request, {
  254 |       full_name: 'Ana@Test',
  255 |       mobile: uniqueData().mobile,
  256 |     });
  257 | 
  258 |     expect(response.status()).toBe(422);
  259 |     expect((await response.json()).detail.full_name).toBe(nameError);
  260 |   });
  261 | 
  262 |   test('A21 · AC-5 · accept a 100-character name', async ({ request }) => {
  263 |     const response = await create(request, {
  264 |       full_name: 'A'.repeat(100),
  265 |       mobile: uniqueData().mobile,
  266 |     });
  267 | 
  268 |     expect(response.status()).toBe(201);
  269 |     expect((await response.json()).taxpayer_id).toBeTruthy();
  270 |   });
  271 | 
  272 |   test('A22 · AC-6 · create taxpayer without optional email', async ({ request }) => {
  273 |     const data = uniqueData();
  274 |     const response = await create(request, data);
  275 | 
> 276 |     expect(response.status()).toBe(201);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  277 |     expect((await response.json()).taxpayer_id).toBeTruthy();
  278 |   });
  279 | 
  280 |   test('A23 · AC-6 · accept formatted email', async ({ request }) => {
  281 |     const data = uniqueData();
  282 |     const response = await create(request, {
  283 |       ...data,
  284 |       email: 'ana@example.com',
  285 |     });
  286 | 
  287 |     expect(response.status()).toBe(201);
  288 |     expect((await response.json()).taxpayer_id).toBeTruthy();
  289 |   });
  290 | 
  291 |   test('A24 · AC-6 · refuse email without at sign', async ({ request }) => {
  292 |     const response = await create(request, {
  293 |       ...uniqueData(),
  294 |       email: 'ana.example.com',
  295 |     });
  296 | 
  297 |     expect(response.status()).toBe(422);
  298 |     expect((await response.json()).detail.email).toBe(emailError);
  299 |   });
  300 | 
  301 |   test('A25 · AC-6 · refuse email without a dot after at sign', async ({ request }) => {
  302 |     const response = await create(request, {
  303 |       ...uniqueData(),
  304 |       email: 'ana@example',
  305 |     });
  306 | 
  307 |     expect(response.status()).toBe(422);
  308 |     expect((await response.json()).detail.email).toBe(emailError);
  309 |   });
  310 | 
  311 |   test('A26 · AC-6 · refuse email exceeding 254 characters', async ({ request }) => {
  312 |     const email = `${'a'.repeat(243)}@example.com`;
  313 |     expect(email.length).toBeGreaterThan(254);
  314 | 
  315 |     const response = await create(request, {
  316 |       ...uniqueData(),
  317 |       email,
  318 |     });
  319 | 
  320 |     expect(response.status()).toBe(422);
  321 |     expect((await response.json()).detail.email).toBe(emailError);
  322 |   });
  323 | 
  324 |   test('A27 · AC-7 · list taxpayer under its creating name-tag', async ({ request }) => {
  325 |     const data = uniqueData();
  326 |     const created = await create(request, data);
  327 |     expect(created.status()).toBe(201);
  328 | 
  329 |     const response = await list(request, tag);
  330 |     expect(response.status()).toBe(200);
  331 | 
  332 |     const body = await response.json();
  333 |     expect(body.some((item: any) => item.mobile === data.mobile)).toBe(true);
  334 |   });
  335 | 
  336 |   test('A28 · AC-7 · hide taxpayer from Mitch-6973-other', async ({ request }) => {
  337 |     const data = uniqueData();
  338 |     await create(request, data);
  339 | 
  340 |     const response = await list(request, `${tag}-other`);
  341 |     expect(response.status()).toBe(200);
  342 | 
  343 |     const body = await response.json();
  344 |     expect(body.some((item: any) => item.mobile === data.mobile)).toBe(false);
  345 |   });
  346 | 
  347 |   test('A29 · AC-7 · hide other name-tag taxpayer from Mitch-6973', async ({ request }) => {
  348 |     const data = uniqueData();
  349 |     await create(request, data, `${tag}-other`);
  350 | 
  351 |     const response = await list(request, tag);
  352 |     expect(response.status()).toBe(200);
  353 | 
  354 |     const body = await response.json();
  355 |     expect(body.some((item: any) => item.mobile === data.mobile)).toBe(false);
  356 |   });
  357 | 
  358 |   test.skip('A30 · AC-7 · retrieve list with empty X-User-ID', async ({ request }) => {
  359 |     // ASK: Expected status and response detail are not specified.
  360 |   });
  361 | 
  362 |   test('A31 · AC-8 · accept 09 followed by nine digits', async ({ request }) => {
  363 |     const response = await create(request, {
  364 |       ...uniqueData(),
  365 |       mobile: '09171234567',
  366 |     });
  367 | 
  368 |     expect(response.status()).toBe(201);
  369 |     expect((await response.json()).taxpayer_id).toBeTruthy();
  370 |   });
  371 | 
  372 |   test('A32 · AC-8 · accept +639 followed by nine digits', async ({ request }) => {
  373 |     const response = await create(request, {
  374 |       ...uniqueData(),
  375 |       mobile: '+639171234567',
  376 |     });
```