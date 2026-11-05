# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/trn-01-register-taxpayer.spec.ts >> TRN-01 · Register a taxpayer · API >> A34 · AC-8 · refuse mobile with ten digits after 09
- Location: tests/api/trn-01-register-taxpayer.spec.ts:392:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "must be a PH mobile 09XXXXXXXXX or +639XXXXXXXXX"
Received: undefined
```

# Test source

```ts
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
  377 | 
  378 |     expect(response.status()).toBe(201);
  379 |     expect((await response.json()).taxpayer_id).toBeTruthy();
  380 |   });
  381 | 
  382 |   test('A33 · AC-8 · refuse mobile with eight digits after 09', async ({ request }) => {
  383 |     const response = await create(request, {
  384 |       ...uniqueData(),
  385 |       mobile: '0917123456',
  386 |     });
  387 | 
  388 |     expect(response.status()).toBe(422);
  389 |     expect((await response.json()).detail.mobile).toBe(mobileError);
  390 |   });
  391 | 
  392 |   test('A34 · AC-8 · refuse mobile with ten digits after 09', async ({ request }) => {
  393 |     const response = await create(request, {
  394 |       ...uniqueData(),
  395 |       mobile: '091712345678',
  396 |     });
  397 | 
  398 |     expect(response.status()).toBe(422);
> 399 |     expect((await response.json()).detail.mobile).toBe(mobileError);
      |                                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  400 |   });
  401 | 
  402 |   test('A35 · AC-8 · refuse mobile containing spaces', async ({ request }) => {
  403 |     const response = await create(request, {
  404 |       ...uniqueData(),
  405 |       mobile: '0917 123 4567',
  406 |     });
  407 | 
  408 |     expect(response.status()).toBe(422);
  409 |     expect((await response.json()).detail.mobile).toBe(mobileError);
  410 |   });
  411 | 
  412 |   test('A36 · AC-8 · refuse mobile containing dashes', async ({ request }) => {
  413 |     const response = await create(request, {
  414 |       ...uniqueData(),
  415 |       mobile: '0917-123-4567',
  416 |     });
  417 | 
  418 |     expect(response.status()).toBe(422);
  419 |     expect((await response.json()).detail.mobile).toBe(mobileError);
  420 |   });
  421 | });
  422 | 
```