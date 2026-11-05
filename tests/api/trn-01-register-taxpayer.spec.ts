// file: tests/api/trn-01-register-taxpayer.spec.ts
import { test, expect, APIRequestContext } from '@playwright/test';

const tenant = 'TAGAYTAY';
const tag = 'Mitch-6973';
let sequence = 0;

function uniqueData() {
  sequence++;
  const suffix = `${Date.now()}${sequence}`.slice(-9);
  const letters = Math.random().toString(36).slice(2, 6).toUpperCase();

  return {
    full_name: `Ana ${letters} Dela Cruz`,
    mobile: `09${suffix}`,
  };
}

function headers(user = tag) {
  return {
    'X-Tenant-ID': tenant,
    'X-User-ID': user,
    'Content-Type': 'application/json',
  };
}

async function create(
  request: APIRequestContext,
  data: Record<string, unknown>,
  user = tag,
) {
  return request.post('/api/v1/training/taxpayers', {
    headers: headers(user),
    data,
  });
}

async function list(request: APIRequestContext, user = tag) {
  return request.get('/api/v1/training/taxpayers', {
    headers: headers(user),
  });
}

const nameError =
  "2-100 characters: letters, spaces, . - ' and Ñ only";
const mobileError =
  'must be a PH mobile 09XXXXXXXXX or +639XXXXXXXXX';
const emailError = 'invalid email format';

test.describe('TRN-01 · Register a taxpayer · API', () => {
  test('A1 · AC-1 · create taxpayer with a unique name and mobile', async ({ request }) => {
    const data = uniqueData();
    const response = await create(request, data);

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.taxpayer_id).toBeTruthy();
  });

  test('A2 · AC-1 · refuse missing full_name', async ({ request }) => {
    const response = await create(request, {
      mobile: uniqueData().mobile,
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.detail.full_name).toBeTruthy();
  });

  test('A3 · AC-1 · refuse missing mobile', async ({ request }) => {
    const response = await create(request, {
      full_name: uniqueData().full_name,
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.detail.mobile).toBeTruthy();
  });

  test('A4 · AC-1 · refuse an empty JSON body', async ({ request }) => {
    const response = await create(request, {});

    expect(response.status()).toBe(422);
  });

  test('A5 · AC-2 · retrieve the taxpayer created under Mitch-6973', async ({ request }) => {
    const data = uniqueData();
    const created = await create(request, data);

    expect(created.status()).toBe(201);
    const createdBody = await created.json();

    const response = await list(request);
    expect(response.status()).toBe(200);

    const body = await response.json();
    const taxpayer = body.find(
      (item: any) => item.taxpayer_id === createdBody.taxpayer_id,
    );

    expect(taxpayer.full_name).toBe(data.full_name);
    expect(taxpayer.mobile).toBe(data.mobile);
  });

  test('A6 · AC-2 · exclude taxpayer from a different name-tag list', async ({ request }) => {
    const data = uniqueData();
    await create(request, data);

    const response = await list(request, `${tag}-other`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.some((item: any) => item.mobile === data.mobile)).toBe(false);
  });

  test('A7 · AC-2 · exclude a taxpayer belonging to another tenant', async ({ request }) => {
    const data = uniqueData();
    await create(request, data);

    const response = await request.get('/api/v1/training/taxpayers', {
      headers: {
        'X-Tenant-ID': 'OTHER-TENANT',
        'X-User-ID': tag,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.some((item: any) => item.mobile === data.mobile)).toBe(false);
  });

  test.skip('A8 · AC-2 · retrieve taxpayers without X-User-ID', async ({ request }) => {
    // ASK: Expected status code and response detail are not specified.
  });

  test('A9 · AC-3 · trim leading and trailing name spaces before storage', async ({ request }) => {
    const data = uniqueData();
    const submittedName = `  ${data.full_name}  `;

    const response = await create(request, {
      ...data,
      full_name: submittedName,
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    const responseList = await list(request);
    const taxpayers = await responseList.json();

    const saved = taxpayers.find(
      (item: any) => item.taxpayer_id === body.taxpayer_id,
    );

    expect(saved.full_name).toBe(data.full_name);
  });

  test.skip('A10 · AC-3 · refuse a name containing only spaces', async ({ request }) => {
    // ASK: Exact behavior for whitespace-only name is not established.
  });

  test('A11 · AC-3 · refuse a one-character name', async ({ request }) => {
    const response = await create(request, {
      full_name: 'A',
      mobile: uniqueData().mobile,
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).detail.full_name).toBe(nameError);
  });

  test('A12 · AC-3 · refuse a 101-character name', async ({ request }) => {
    const response = await create(request, {
      full_name: 'A'.repeat(101),
      mobile: uniqueData().mobile,
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).detail.full_name).toBe(nameError);
  });

  test('A13 · AC-4 · create taxpayer using an unregistered mobile', async ({ request }) => {
    const response = await create(request, uniqueData());

    expect(response.status()).toBe(201);
    expect((await response.json()).taxpayer_id).toBeTruthy();
  });

  test('A14 · AC-4 · refuse reuse of an already registered mobile', async ({ request }) => {
    const data = uniqueData();
    expect((await create(request, data)).status()).toBe(201);

    const response = await create(request, {
      ...data,
      full_name: uniqueData().full_name,
    });

    expect(response.status()).toBe(409);
    expect((await response.json()).detail.mobile)
      .toBe('already registered for this tenant');
  });

  test('A15 · AC-4 · refuse duplicate mobile with a different taxpayer name', async ({ request }) => {
    const data = uniqueData();
    await create(request, data);

    const response = await create(request, {
      full_name: 'Maria Santos',
      mobile: data.mobile,
    });

    expect(response.status()).toBe(409);
    expect((await response.json()).detail.mobile)
      .toBe('already registered for this tenant');
  });

  test.skip('A16 · AC-4 · check duplicate mobile under another name-tag', async ({ request }) => {
    // ASK: Confirm whether duplicate mobile registration is tenant-wide
    // or isolated by name-tag.
  });

  test('A17 · AC-5 · accept a two-character alphabetic name', async ({ request }) => {
    const response = await create(request, {
      full_name: 'Jo',
      mobile: uniqueData().mobile,
    });

    expect(response.status()).toBe(201);
    expect((await response.json()).taxpayer_id).toBeTruthy();
  });

  test('A18 · AC-5 · refuse a one-character name', async ({ request }) => {
    const response = await create(request, {
      full_name: 'J',
      mobile: uniqueData().mobile,
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).detail.full_name).toBe(nameError);
  });

  test('A19 · AC-5 · refuse a 101-character name', async ({ request }) => {
    const response = await create(request, {
      full_name: 'A'.repeat(101),
      mobile: uniqueData().mobile,
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).detail.full_name).toBe(nameError);
  });

  test('A20 · AC-5 · refuse a name containing an at sign', async ({ request }) => {
    const response = await create(request, {
      full_name: 'Ana@Test',
      mobile: uniqueData().mobile,
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).detail.full_name).toBe(nameError);
  });

  test('A21 · AC-5 · accept a 100-character name', async ({ request }) => {
    const response = await create(request, {
      full_name: 'A'.repeat(100),
      mobile: uniqueData().mobile,
    });

    expect(response.status()).toBe(201);
    expect((await response.json()).taxpayer_id).toBeTruthy();
  });

  test('A22 · AC-6 · create taxpayer without optional email', async ({ request }) => {
    const data = uniqueData();
    const response = await create(request, data);

    expect(response.status()).toBe(201);
    expect((await response.json()).taxpayer_id).toBeTruthy();
  });

  test('A23 · AC-6 · accept formatted email', async ({ request }) => {
    const data = uniqueData();
    const response = await create(request, {
      ...data,
      email: 'ana@example.com',
    });

    expect(response.status()).toBe(201);
    expect((await response.json()).taxpayer_id).toBeTruthy();
  });

  test('A24 · AC-6 · refuse email without at sign', async ({ request }) => {
    const response = await create(request, {
      ...uniqueData(),
      email: 'ana.example.com',
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).detail.email).toBe(emailError);
  });

  test('A25 · AC-6 · refuse email without a dot after at sign', async ({ request }) => {
    const response = await create(request, {
      ...uniqueData(),
      email: 'ana@example',
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).detail.email).toBe(emailError);
  });

  test('A26 · AC-6 · refuse email exceeding 254 characters', async ({ request }) => {
    const email = `${'a'.repeat(243)}@example.com`;
    expect(email.length).toBeGreaterThan(254);

    const response = await create(request, {
      ...uniqueData(),
      email,
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).detail.email).toBe(emailError);
  });

  test('A27 · AC-7 · list taxpayer under its creating name-tag', async ({ request }) => {
    const data = uniqueData();
    const created = await create(request, data);
    expect(created.status()).toBe(201);

    const response = await list(request, tag);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.some((item: any) => item.mobile === data.mobile)).toBe(true);
  });

  test('A28 · AC-7 · hide taxpayer from Mitch-6973-other', async ({ request }) => {
    const data = uniqueData();
    await create(request, data);

    const response = await list(request, `${tag}-other`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.some((item: any) => item.mobile === data.mobile)).toBe(false);
  });

  test('A29 · AC-7 · hide other name-tag taxpayer from Mitch-6973', async ({ request }) => {
    const data = uniqueData();
    await create(request, data, `${tag}-other`);

    const response = await list(request, tag);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.some((item: any) => item.mobile === data.mobile)).toBe(false);
  });

  test.skip('A30 · AC-7 · retrieve list with empty X-User-ID', async ({ request }) => {
    // ASK: Expected status and response detail are not specified.
  });

  test('A31 · AC-8 · accept 09 followed by nine digits', async ({ request }) => {
    const response = await create(request, {
      ...uniqueData(),
      mobile: '09171234567',
    });

    expect(response.status()).toBe(201);
    expect((await response.json()).taxpayer_id).toBeTruthy();
  });

  test('A32 · AC-8 · accept +639 followed by nine digits', async ({ request }) => {
    const response = await create(request, {
      ...uniqueData(),
      mobile: '+639171234567',
    });

    expect(response.status()).toBe(201);
    expect((await response.json()).taxpayer_id).toBeTruthy();
  });

  test('A33 · AC-8 · refuse mobile with eight digits after 09', async ({ request }) => {
    const response = await create(request, {
      ...uniqueData(),
      mobile: '0917123456',
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).detail.mobile).toBe(mobileError);
  });

  test('A34 · AC-8 · refuse mobile with ten digits after 09', async ({ request }) => {
    const response = await create(request, {
      ...uniqueData(),
      mobile: '091712345678',
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).detail.mobile).toBe(mobileError);
  });

  test('A35 · AC-8 · refuse mobile containing spaces', async ({ request }) => {
    const response = await create(request, {
      ...uniqueData(),
      mobile: '0917 123 4567',
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).detail.mobile).toBe(mobileError);
  });

  test('A36 · AC-8 · refuse mobile containing dashes', async ({ request }) => {
    const response = await create(request, {
      ...uniqueData(),
      mobile: '0917-123-4567',
    });

    expect(response.status()).toBe(422);
    expect((await response.json()).detail.mobile).toBe(mobileError);
  });
});
