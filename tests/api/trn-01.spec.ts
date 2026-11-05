// file: tests/api/trn-01.spec.ts
import { test, expect } from '@playwright/test';

const baseHeaders = {
  'X-Tenant-ID': 'TAGAYTAY',
  'X-User-ID': 'Mitch-6973',
  'Content-Type': 'application/json',
};

const unique = () => Array.from({ length: 4 }, () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]).join('');
const mobile = () =>
  '09' + String(Date.now()).slice(-9);

const taxpayer = (overrides = {}) => ({
  full_name: `Ana ${unique()} Dela Cruz`,
  mobile: mobile(),
  ...overrides,
});

async function create(request: any, data: any) {
  return request.post('/api/v1/training/taxpayers', {
    headers: baseHeaders,
    data,
  });
}

test('A1 · AC-1 · create taxpayer with unique name and mobile', async ({ request }) => {
  const data = taxpayer();
  const response = await create(request, data);

  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.taxpayer_id).toBeTruthy();
});

test('A4 · AC-1 · refuse duplicate mobile', async ({ request }) => {
  const data = taxpayer();
  const first = await create(request, data);
  expect(first.status()).toBe(201);

  const second = await create(request, {
    ...taxpayer(),
    mobile: data.mobile,
  });

  expect(second.status()).toBe(409);
  expect(await second.json()).toEqual({
    detail: { mobile: 'already registered for this tenant' },
  });
});

test.fixme('A2 · AC-1 · ASK: required-field behavior for empty full_name', async () => {});

test.fixme('A3 · AC-1 · ASK: required-field behavior for empty mobile', async () => {});

test.fixme('A5 · AC-2 · ASK: GET status code and response schema', async () => {});

test.fixme('A6 · AC-2 · ASK: exact empty taxpayer-list API response', async () => {});

test.fixme('A7 · AC-3 · ASK: exact stored full_name in GET response', async () => {});

test('A8 · AC-4 · refuse mobile already registered for TAGAYTAY', async ({ request }) => {
  const data = taxpayer();
  const first = await create(request, data);
  expect(first.status()).toBe(201);

  const second = await create(request, {
    ...taxpayer(),
    mobile: data.mobile,
  });

  expect(second.status()).toBe(409);
  expect(await second.json()).toEqual({
    detail: { mobile: 'already registered for this tenant' },
  });
});

test('A9 · AC-4 · refuse a second registration using the same mobile', async ({ request }) => {
  const data = taxpayer();
  await create(request, data);

  const response = await create(request, {
    ...taxpayer(),
    mobile: data.mobile,
  });

  expect(response.status()).toBe(409);
  expect(await response.json()).toEqual({
    detail: { mobile: 'already registered for this tenant' },
  });
});

test.fixme('A10 · AC-4 · ASK: duplicate detection for 09 and +639 representations', async () => {});

test.fixme('A11 · AC-4 · ASK: exact persistence behavior after duplicate submission', async () => {});

test('A12 · AC-5 · accept a two-character permitted name', async ({ request }) => {
  const response = await create(request, {
    full_name: 'Ña',
    mobile: mobile(),
  });

  expect(response.status()).toBe(201);
  expect((await response.json()).taxpayer_id).toBeTruthy();
});

test('A13 · AC-5 · refuse the one-character name "A"', async ({ request }) => {
  const response = await create(request, {
    full_name: 'A',
    mobile: mobile(),
  });

  expect(response.status()).toBe(422);
  expect(await response.json()).toEqual({
    detail: {
      full_name: "2-100 characters: letters, spaces, . - ' and Ñ only",
    },
  });
});

test('A14 · AC-5 · refuse a 101-character name', async ({ request }) => {
  const response = await create(request, {
    full_name: 'A'.repeat(101),
    mobile: mobile(),
  });

  expect(response.status()).toBe(422);
  expect(await response.json()).toEqual({
    detail: {
      full_name: "2-100 characters: letters, spaces, . - ' and Ñ only",
    },
  });
});

test('A15 · AC-5 · refuse a name containing @', async ({ request }) => {
  const response = await create(request, {
    full_name: 'Ana@Test',
    mobile: mobile(),
  });

  expect(response.status()).toBe(422);
  expect(await response.json()).toEqual({
    detail: {
      full_name: "2-100 characters: letters, spaces, . - ' and Ñ only",
    },
  });
});

test.fixme('A16 · AC-6 · ASK: exact API response when optional email is omitted', async () => {});

test.fixme('A17 · AC-6 · ASK: acceptance of a 254-character email address', async () => {});

test('A18 · AC-6 · refuse email without @', async ({ request }) => {
  const response = await create(request, {
    ...taxpayer(),
    email: 'ana.example.com',
  });

  expect(response.status()).toBe(422);
  expect(await response.json()).toEqual({
    detail: { email: 'invalid email format' },
  });
});

test('A19 · AC-6 · refuse email with two @ characters', async ({ request }) => {
  const response = await create(request, {
    ...taxpayer(),
    email: 'ana@@example.com',
  });

  expect(response.status()).toBe(422);
  expect(await response.json()).toEqual({
    detail: { email: 'invalid email format' },
  });
});

test('A20 · AC-6 · refuse a 255-character email', async ({ request }) => {
  const email = 'a'.repeat(243) + '@example.com';
  expect(email.length).toBe(255);

  const response = await create(request, {
    ...taxpayer(),
    email,
  });

  expect(response.status()).toBe(422);
  expect(await response.json()).toEqual({
    detail: { email: 'invalid email format' },
  });
});

test.fixme('A21 · AC-7 · ASK: exact GET response structure for Mitch-6973', async () => {});

test.fixme('A22 · AC-7 · ASK: exact empty-list response for Mitch-6973-other', async () => {});

test.fixme('A23 · AC-8 · ASK: exact API response for mobile 09123456789', async () => {});

test.fixme('A24 · AC-8 · ASK: exact API response for mobile +639123456789', async () => {});

test('A25 · AC-8 · refuse mobile beginning with 08', async ({ request }) => {
  const response = await create(request, {
    ...taxpayer(),
    mobile: '08123456789',
  });

  expect(response.status()).toBe(422);
  expect(await response.json()).toEqual({
    detail: {
      mobile: 'must be a PH mobile 09XXXXXXXXX or +639XXXXXXXXX',
    },
  });
});

test('A26 · AC-8 · refuse ten-digit mobile 0912345678', async ({ request }) => {
  const response = await create(request, {
    ...taxpayer(),
    mobile: '0912345678',
  });

  expect(response.status()).toBe(422);
  expect(await response.json()).toEqual({
    detail: {
      mobile: 'must be a PH mobile 09XXXXXXXXX or +639XXXXXXXXX',
    },
  });
});

test('A27 · AC-8 · refuse twelve-digit mobile 091234567890', async ({ request }) => {
  const response = await create(request, {
    ...taxpayer(),
    mobile: '091234567890',
  });

  expect(response.status()).toBe(422);
  expect(await response.json()).toEqual({
    detail: {
      mobile: 'must be a PH mobile 09XXXXXXXXX or +639XXXXXXXXX',
    },
  });
});

test('A28 · AC-8 · refuse mobile containing a space', async ({ request }) => {
  const response = await create(request, {
    ...taxpayer(),
    mobile: '09123 456789',
  });

  expect(response.status()).toBe(422);
  expect(await response.json()).toEqual({
    detail: {
      mobile: 'must be a PH mobile 09XXXXXXXXX or +639XXXXXXXXX',
    },
  });
});

test('A29 · AC-8 · refuse mobile containing a dash', async ({ request }) => {
  const response = await create(request, {
    ...taxpayer(),
    mobile: '09123-456789',
  });

  expect(response.status()).toBe(422);
  expect(await response.json()).toEqual({
    detail: {
      mobile: 'must be a PH mobile 09XXXXXXXXX or +639XXXXXXXXX',
    },
  });
});
