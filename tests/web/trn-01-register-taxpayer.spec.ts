// file: tests/web/trn-01-register-taxpayer.spec.ts
import { test, expect, Page } from '@playwright/test';

const tag = 'Mitch-6973';
let sequence = 0;

function data() {
  sequence++;
  const suffix = `${Date.now()}${sequence}`.slice(-9);
  const letters = Math.random().toString(36).slice(2, 6).toUpperCase();

  return {
    name: `Ana ${letters} Dela Cruz`,
    mobile: `09${suffix}`,
  };
}

async function enterApplication(page: Page, nameTag = tag) {
  await page.goto('/');

  const nameBox = page.getByLabel('Your name');
  await expect(nameBox).toBeVisible();
  await nameBox.fill(nameTag);
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Create my data'),
  ).toBeVisible();
}

async function openCreate(page: Page) {
  await page.getByText('Create my data').click();
  await expect(page.getByLabel('Full name')).toBeVisible();
}

async function submitTaxpayer(
  page: Page,
  name: string,
  mobile: string,
  email?: string,
) {
  await page.getByLabel('Full name').fill(name);
  await page.getByLabel('Mobile (09XXXXXXXXX)').fill(mobile);

  if (email !== undefined) {
    await page.getByLabel('Email (optional)').fill(email);
  }

  await page.getByRole('button', { name: 'Create taxpayer' }).click();
}

async function openMyTaxpayers(page: Page) {
  await page.getByText('My data').click();
  await page.getByText('My taxpayers').click();
}

test.describe('TRN-01 · Register a taxpayer · Web', () => {
  test('W1 · AC-1 · display created name and mobile', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, d.name, d.mobile);

    await expect(page.getByText(
      `${d.name} created — mobile ${d.mobile}.`,
      { exact: true },
    )).toBeVisible();
  });

  test.skip('W2 · AC-1 · refuse missing Full name', async () => {
    // ASK: Exact missing-name field message is not specified.
  });

  test.skip('W3 · AC-1 · refuse missing Mobile', async () => {
    // ASK: Exact missing-mobile field message is not specified.
  });

  test.skip('W4 · AC-1 · refuse submission with both fields empty', async () => {
    // ASK: Exact form feedback is not specified.
  });

  test('W5 · AC-2 · show the created taxpayer in My taxpayers', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, d.name, d.mobile);
    await openMyTaxpayers(page);

    await expect(page.getByText(d.name, { exact: true })).toBeVisible();
    await expect(page.getByText(d.mobile, { exact: true })).toBeVisible();
  });

  test('W6 · AC-2 · keep an unsubmitted taxpayer out of My taxpayers', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);

    await page.getByLabel('Full name').fill(d.name);
    await page.getByLabel('Mobile (09XXXXXXXXX)').fill(d.mobile);
    await openMyTaxpayers(page);

    await expect(page.getByText(d.name, { exact: true })).toHaveCount(0);
  });

  test.skip('W7 · AC-2 · show empty-state before taxpayer creation', async () => {
    // ASK: Exact initial empty-state text is not specified.
  });

  test('W8 · AC-2 · hide taxpayer when another name-tag is used', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, d.name, d.mobile);

    await page.getByText('Change').click();
    await page.getByLabel('Your name').fill(`${tag}-other`);
    await page.getByRole('button', { name: 'Save' }).click();

    await openMyTaxpayers(page);
    await expect(page.getByText(d.name, { exact: true })).toHaveCount(0);
  });

  test('W9 · AC-3 · remove spaces around name in both displays', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, `  ${d.name}  `, d.mobile);

    await expect(page.getByText(
      `${d.name} created — mobile ${d.mobile}.`,
      { exact: true },
    )).toBeVisible();

    await openMyTaxpayers(page);
    await expect(page.getByText(d.name, { exact: true })).toBeVisible();
  });

  test('W10 · AC-3 · refuse whitespace-only name', async ({ page }) => {
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, '     ', data().mobile);

    await expect(page.getByText(
      "2-100 characters: letters, spaces, . - ' and Ñ only",
    )).toBeVisible();
  });

  test('W11 · AC-3 · refuse one-character name', async ({ page }) => {
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, 'A', data().mobile);

    await expect(page.getByText(
      "2-100 characters: letters, spaces, . - ' and Ñ only",
    )).toBeVisible();
  });

  test('W12 · AC-3 · refuse 101-character name', async ({ page }) => {
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, 'A'.repeat(101), data().mobile);

    await expect(page.getByText(
      "2-100 characters: letters, spaces, . - ' and Ñ only",
    )).toBeVisible();
  });

  test('W13 · AC-4 · display a taxpayer created with a new mobile', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, d.name, d.mobile);

    await expect(page.getByText(
      `${d.name} created — mobile ${d.mobile}.`,
      { exact: true },
    )).toBeVisible();
  });

  test('W14 · AC-4 · refuse an already registered mobile', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, d.name, d.mobile);

    await openCreate(page);
    await submitTaxpayer(page, data().name, d.mobile);

    await expect(page.getByText(
      'already registered for this tenant',
    )).toBeVisible();
  });

  test('W15 · AC-4 · refuse duplicate mobile with another name', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, d.name, d.mobile);

    await openCreate(page);
    await submitTaxpayer(page, 'Maria Santos', d.mobile);

    await expect(page.getByText(
      'already registered for this tenant',
    )).toBeVisible();
  });

  test.skip('W16 · AC-4 · check duplicate mobile under another name-tag', async () => {
    // ASK: Confirm cross-name-tag mobile uniqueness.
  });

  test('W17 · AC-5 · accept two-character name', async ({ page }) => {
    const mobile = data().mobile;
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, 'Jo', mobile);

    await expect(page.getByText(
      `Jo created — mobile ${mobile}.`,
      { exact: true },
    )).toBeVisible();
  });

  test('W18 · AC-5 · refuse one-character name', async ({ page }) => {
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, 'A', data().mobile);

    await expect(page.getByText(
      "2-100 characters: letters, spaces, . - ' and Ñ only",
    )).toBeVisible();
  });

  test('W19 · AC-5 · refuse 101-character name', async ({ page }) => {
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, 'A'.repeat(101), data().mobile);

    await expect(page.getByText(
      "2-100 characters: letters, spaces, . - ' and Ñ only",
    )).toBeVisible();
  });

  test('W20 · AC-5 · refuse name containing at sign', async ({ page }) => {
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, 'Ana@Test', data().mobile);

    await expect(page.getByText(
      "2-100 characters: letters, spaces, . - ' and Ñ only",
    )).toBeVisible();
  });

  test('W21 · AC-5 · accept 100-character name', async ({ page }) => {
    const mobile = data().mobile;
    const name = 'A'.repeat(100);

    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, name, mobile);

    await expect(page.getByText(
      `${name} created — mobile ${mobile}.`,
      { exact: true },
    )).toBeVisible();
  });

  test('W22 · AC-6 · create taxpayer with email left empty', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, d.name, d.mobile);

    await expect(page.getByText(
      `${d.name} created — mobile ${d.mobile}.`,
      { exact: true },
    )).toBeVisible();
  });

  test('W23 · AC-6 · create taxpayer with formatted email', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, d.name, d.mobile, 'ana@example.com');

    await expect(page.getByText(
      `${d.name} created — mobile ${d.mobile}.`,
      { exact: true },
    )).toBeVisible();
  });

  test('W24 · AC-6 · refuse email without at sign', async ({ page }) => {
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, data().name, data().mobile, 'ana.example.com');

    await expect(page.getByText('invalid email format')).toBeVisible();
  });

  test('W25 · AC-6 · refuse email without dot after at sign', async ({ page }) => {
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, data().name, data().mobile, 'ana@example');

    await expect(page.getByText('invalid email format')).toBeVisible();
  });

  test('W26 · AC-6 · refuse email exceeding 254 characters', async ({ page }) => {
    const email = `${'a'.repeat(243)}@example.com`;
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, data().name, data().mobile, email);

    await expect(page.getByText('invalid email format')).toBeVisible();
  });

  test('W27 · AC-7 · show taxpayer under Mitch-6973', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, d.name, d.mobile);
    await openMyTaxpayers(page);

    await expect(page.getByText(d.name, { exact: true })).toBeVisible();
  });

  test('W28 · AC-7 · show empty state under Mitch-6973-other', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, d.name, d.mobile);

    await page.getByText('Change').click();
    await page.getByLabel('Your name').fill(`${tag}-other`);
    await page.getByRole('button', { name: 'Save' }).click();

    await openMyTaxpayers(page);

    await expect(page.getByText(
      'None yet — create one in Training setup.',
      { exact: true },
    )).toBeVisible();

    await expect(page.getByText(d.name, { exact: true })).toHaveCount(0);
  });

  test('W29 · AC-7 · keep original taxpayer hidden under other name-tag', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, d.name, d.mobile);

    await page.getByText('Change').click();
    await page.getByLabel('Your name').fill(`${tag}-other`);
    await page.getByRole('button', { name: 'Save' }).click();
    await openMyTaxpayers(page);

    await expect(page.getByText(d.mobile, { exact: true })).toHaveCount(0);
  });

  test('W30 · AC-7 · hide other name-tag taxpayer from Mitch-6973', async ({ page }) => {
    const d = data();
    await enterApplication(page, `${tag}-other`);
    await openCreate(page);
    await submitTaxpayer(page, d.name, d.mobile);

    await page.getByText('Change').click();
    await page.getByLabel('Your name').fill(tag);
    await page.getByRole('button', { name: 'Save' }).click();
    await openMyTaxpayers(page);

    await expect(page.getByText(d.name, { exact: true })).toHaveCount(0);
  });

  test('W31 · AC-8 · accept 09 followed by nine digits', async ({ page }) => {
    const d = data();
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, d.name, d.mobile);

    await expect(page.getByText(
      `${d.name} created — mobile ${d.mobile}.`,
      { exact: true },
    )).toBeVisible();
  });

  test('W32 · AC-8 · accept +639 followed by nine digits', async ({ page }) => {
    const d = data();
    const mobile = `+639${d.mobile.slice(2)}`;

    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, d.name, mobile);

    await expect(page.getByText(
      `${d.name} created — mobile ${mobile}.`,
      { exact: true },
    )).toBeVisible();
  });

  test('W33 · AC-8 · refuse mobile with eight digits after 09', async ({ page }) => {
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, data().name, '0917123456');

    await expect(page.getByText(
      'must be a PH mobile 09XXXXXXXXX or +639XXXXXXXXX',
    )).toBeVisible();
  });

  test('W34 · AC-8 · refuse mobile with ten digits after 09', async ({ page }) => {
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, data().name, '091712345678');

    await expect(page.getByText(
      'must be a PH mobile 09XXXXXXXXX or +639XXXXXXXXX',
    )).toBeVisible();
  });

  test('W35 · AC-8 · refuse mobile containing spaces', async ({ page }) => {
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, data().name, '0917 123 4567');

    await expect(page.getByText(
      'must be a PH mobile 09XXXXXXXXX or +639XXXXXXXXX',
    )).toBeVisible();
  });

  test('W36 · AC-8 · refuse mobile containing dashes', async ({ page }) => {
    await enterApplication(page);
    await openCreate(page);
    await submitTaxpayer(page, data().name, '0917-123-4567');

    await expect(page.getByText(
      'must be a PH mobile 09XXXXXXXXX or +639XXXXXXXXX',
    )).toBeVisible();
  });
});
