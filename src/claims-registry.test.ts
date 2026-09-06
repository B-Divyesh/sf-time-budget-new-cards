import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

interface Claim { id: string; claim: string; where: string; test: string; sandbox: string }

const claims = JSON.parse(readFileSync(fileURLToPath(new URL('../.factory/claims.json', import.meta.url)), 'utf8')) as Claim[];
const browserTests = readFileSync(fileURLToPath(new URL('../tests/claims.spec.ts', import.meta.url)), 'utf8');

describe('public claim registry', () => {
  it('declares unique complete claims with one browser-test tag each', () => {
    expect(claims.length).toBeGreaterThan(0);
    expect(new Set(claims.map((claim) => claim.id)).size).toBe(claims.length);
    for (const claim of claims) {
      expect(claim.claim).not.toBe('');
      expect(claim.where).not.toBe('');
      expect(claim.sandbox).not.toBe('');
      expect(claim.test).toBe(`npm run test:claim -- --grep "@claim:${claim.id}"`);
      expect(browserTests.split(`@claim:${claim.id}`).length - 1).toBe(1);
    }
  });
});
