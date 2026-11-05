// file: tests/integration/trn-01.spec.ts
import { test, expect } from '@playwright/test';

const unique = () => Math.random().toString(36).slice(2, 6);
const mobile = () => '09' + String(Date.now()).slice(-9);
const headers = {
  'X-Tenant-ID': 'TAGAYTAY',
  'X-User-ID': 'Mitch-6973',
  'Content-Type': 'application/json',
};

test.fixme(
  'I1 · AC-2 · ASK: compare created taxpayer with GET response using exact response schema and status code',
);

test.fixme(
  'I2 · AC-3 · ASK: compare trimmed name in creation message, POST response and GET response',
);

test.fixme(
  'I3 · AC-7 · ASK: compare empty GET response and empty screen under Mitch-6973-other',
);
