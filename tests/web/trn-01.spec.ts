// file: tests/web/trn-01.spec.ts
import { test, expect } from '@playwright/test';

const unique = () => Math.random().toString(36).slice(2, 6);
const mobile = () => '09' + String(Date.now()).slice(-9);
const name = () => `Ana ${unique()} Dela Cruz`;

async function setup(page: any, nameTag = 'Mitch-6973') {
  await page.goto('/');

  const nameBox = page.getByText('Your name');
  await expect(nameBox).toBeVisible();

  await page.getByRole('textbox').first().fill(nameTag);
  await page.getByRole('button', { name: 'Save' }).click();
}

async function openCreate(page: any) {
  await page.getByText('Training setup').click();
  await page.getByText('Create my data').click();
}

async function openMyTaxpayers(page: any) {
  await page.getByText('My data').click();
  await page.getByText('My taxpayers').click();
}

test('W1 · AC-1 · show created message for a unique taxpayer', async ({ page }) => {
  const fullName = name();
  const phone = mobile();

  await setup(page);
  await openCreate(page);

  await page.getByLabel('Full name').fill(fullName);
  await page.getByLabel('Mobile (09XXXXXXXXX)').fill(phone);
  await page.getByRole('button', { name: 'Create taxpayer' }).click();

  await expect(page.getByText(
    `${fullName} created — mobile ${phone}.`,
    { exact: true }
  )).toBeVisible();
});

test.fixme('W3 · AC-2 · ASK: exact empty-list screen state before taxpayer creation');

test.fixme('W4 · AC-3 · ASK: whether internal repeated spaces are preserved');

test.fixme('W5 · AC-3 · ASK: exact name persistence after page reload');

test.fixme('W6 · AC-4 · ASK: exact screen presentation for duplicate mobile');

test('W7 · AC-5 · refuse a one-character name', async ({ page }) => {
  await setup(page);
  await openCreate(page);

  await page.getByLabel('Full name').fill('A');
  await page.getByLabel('Mobile (09XXXXXXXXX)').fill(mobile());
  await page.getByRole('button', { name: 'Create taxpayer' }).click();

  await expect(page.getByText(
    "2-100 characters: letters, spaces, . - ' and Ñ only"
  )).toBeVisible();
});

test.fixme('W8 · AC-5 · ASK: exact form behavior for a name containing @');

test.fixme('W9 · AC-6 · ASK: exact screen behavior for an email without a dot after @');

test('W10 · AC-7 · show taxpayer under Mitch-6973', async ({ page }) => {
  const fullName = name();
  const phone = mobile();

  await setup(page, 'Mitch-6973');
  await openCreate(page);

  await page.getByLabel('Full name').fill(fullName);
  await page.getByLabel('Mobile (09XXXXXXXXX)').fill(phone);
  await page.getByRole('button', { name: 'Create taxpayer' }).click();

  await openMyTaxpayers(page);

  await expect(page.getByText(fullName, { exact: true })).toBeVisible();
  await expect(page.getByText(phone, { exact: true })).toBeVisible();
});

test('W11 · AC-7 · show empty-data message under Mitch-6973-other', async ({ page }) => {
  await setup(page, 'Mitch-6973');

  await openCreate(page);
  await page.getByLabel('Full name').fill(name());
  await page.getByLabel('Mobile (09XXXXXXXXX)').fill(mobile());
  await page.getByRole('button', { name: 'Create taxpayer' }).click();

  await page.getByText('Change', { exact: true }).click();
  await page.getByRole('textbox').fill('Mitch-6973-other');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByText('My data').click();

  await expect(page.getByText(
    'None yet — create one in Training setup.',
    { exact: true }
  )).toBeVisible();
});

test('W12 · AC-7 · show empty taxpayer lists under Mitch-6973-other', async ({ page }) => {
  await setup(page, 'Mitch-6973');

  await openCreate(page);
  await page.getByLabel('Full name').fill(name());
  await page.getByLabel('Mobile (09XXXXXXXXX)').fill(mobile());
  await page.getByRole('button', { name: 'Create taxpayer' }).click();

  await page.getByText('Change', { exact: true }).click();
  await page.getByRole('textbox').fill('Mitch-6973-other');
  await page.getByRole('button', { name: 'Save' }).click();

  await openMyTaxpayers(page);

  await expect(page.getByText('None yet — create one in Training setup.')).toBeVisible();
});

test.fixme('W13 · AC-8 · ASK: exact form behavior and message timing for mobile containing letters');
