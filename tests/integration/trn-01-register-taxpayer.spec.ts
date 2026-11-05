// file: tests/integration/trn-01-register-taxpayer.spec.ts
import { test, expect, Page } from '@playwright/test';

const tag = 'Mitch-6973';
let sequence = 0;

function uniqueData() {
  sequence++;
  const suffix = `${Date.now()}${sequence}`.slice(-9);
  const letters = Math.random().toString(36).slice(2, 6).toUpperCase();

  return {
    name: `Ana ${letters} Dela Cruz`,
    mobile: `09${suffix}`,
  };
}

const apiHeaders = (user = tag) => ({
  'X-Tenant-ID': 'TAGAYTAY',
  'X-User-ID': user,
});

async function setup(page: Page, nameTag = tag) {
  await page.goto('/');
  await page.getByLabel('Your name').fill(nameTag);
  await page.getByRole('button', { name: 'Save' }).click();
}

async function createOnScreen(
  page: Page,
  name: string,
  mobile: string,
) {
  await page.getByText('Create my data').click();
  await page.getByLabel('Full name').fill(name);
  await page.getByLabel('Mobile (09XXXXXXXXX)').fill(mobile);
  await page.getByRole('button', { name: 'Create taxpayer' }).click();
}

async function getMyTaxpayers(request: any, nameTag = tag) {
  return request.get('/api/v1/training/taxpayers', {
    headers: apiHeaders(nameTag),
  });
}

test.describe('TRN-01 · Register a taxpayer · Integration', () => {
  test('I1 · AC-2 · compare created screen details with stored API details', async ({ page, request }) => {
    const d = uniqueData();

    await setup(page);
    await createOnScreen(page, d.name, d.mobile);

    await expect(page.getByText(
      `${d.name} created — mobile ${d.mobile}.`,
      { exact: true },
    )).toBeVisible();

    const response = await getMyTaxpayers(request);
    expect(response.status()).toBe(200);

    const body = await response.json();
    const saved = body.find(
      (item: any) =>
        item.full_name === d.name &&
        item.mobile === d.mobile,
    );

    expect(saved).toBeTruthy();

    await page.getByText('My data').click();
    await page.getByText('My taxpayers').click();

    await expect(page.getByText(d.name, { exact: true })).toBeVisible();
    await expect(page.getByText(d.mobile, { exact: true })).toBeVisible();
  });

  test('I2 · AC-3 · compare trimmed screen name with trimmed API name', async ({ page, request }) => {
    const d = uniqueData();

    await setup(page);
    await createOnScreen(page, `  ${d.name}  `, d.mobile);

    await expect(page.getByText(
      `${d.name} created — mobile ${d.mobile}.`,
      { exact: true },
    )).toBeVisible();

    const response = await getMyTaxpayers(request);
    expect(response.status()).toBe(200);

    const body = await response.json();
    const saved = body.find(
      (item: any) => item.mobile === d.mobile,
    );

    expect(saved.full_name).toBe(d.name);
    expect(saved.full_name.startsWith(' ')).toBe(false);
    expect(saved.full_name.endsWith(' ')).toBe(false);

    await page.getByText('My data').click();
    await page.getByText('My taxpayers').click();

    await expect(page.getByText(d.name, { exact: true })).toBeVisible();
  });

  test('I3 · AC-7 · compare taxpayer visibility across two name-tags', async ({ page, request }) => {
    const d = uniqueData();

    await setup(page);
    await createOnScreen(page, d.name, d.mobile);

    const ownList = await getMyTaxpayers(request, tag);
    expect(ownList.status()).toBe(200);

    const ownBody = await ownList.json();
    expect(ownBody.some(
      (item: any) => item.mobile === d.mobile,
    )).toBe(true);

    await page.getByText('Change').click();
    await page.getByLabel('Your name').fill(`${tag}-other`);
    await page.getByRole('button', { name: 'Save' }).click();

    const otherList = await getMyTaxpayers(request, `${tag}-other`);
    expect(otherList.status()).toBe(200);

    const otherBody = await otherList.json();
    expect(otherBody.some(
      (item: any) => item.mobile === d.mobile,
    )).toBe(false);

    await page.getByText('My data').click();
    await page.getByText('My taxpayers').click();

    await expect(page.getByText(
      'None yet — create one in Training setup.',
      { exact: true },
    )).toBeVisible();

    await expect(page.getByText(d.name, { exact: true })).toHaveCount(0);
  });
});
