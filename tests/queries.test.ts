import assert from 'node:assert/strict';
import { test } from 'node:test';
import { candidateInput, compatibilityInput, findCandidates, searchCompatibility } from '../src/queries.js';
import { catalogSchema } from '../src/catalog.js';
import { fixture } from './fixture.js';

test('candidate tags do not become eligibility claims or source-only APKs', () => {
  const { catalog } = fixture();
  const result = findCandidates(catalog, candidateInput.parse({ brand: 'BYD', android: '8.1' }));
  assert.deepEqual(result.items.map((item) => item.id), ['official', 'test-apk']);
  assert(result.items.every((item) => item.selectionStatus === 'requires-guide-review'));
  assert(result.items.every((item) => !('downloads' in item)));
  const mismatch = findCandidates(catalog, candidateInput.parse({ android: '8.0' }));
  assert.deepEqual(mismatch.items.map((item) => item.id), ['official']);
  const unknown = findCandidates(catalog, candidateInput.parse({}));
  assert.equal(unknown.total, 2);
});

test('compatibility preserves exact minor versions, unknowns and older-release boundaries', () => {
  const { catalog } = fixture();
  const result = searchCompatibility(catalog, compatibilityInput.parse({ brand: 'byd', model: '宋 PLUS', android: '8.1', diplayVersion: 'tested-version', connection: 'wired' }));
  assert.equal(result.exactCount, 1);
  assert.equal(result.relatedCount, 2);
  assert.equal(result.items[0]!.record.id, 'report-1');
  assert.equal(result.items[0]!.record.status, 'limited-evidence');
  assert.equal(result.items[0]!.record.audio, 'unknown');
  assert(result.missingComparisonFields.includes('ios'));
  const newer = searchCompatibility(catalog, compatibilityInput.parse({ brand: 'BYD', model: 'Song Plus', diplayVersion: 'new-version' }));
  assert.equal(newer.exactCount, 0);
  assert.equal(newer.relatedCount, 3);
  const variant = searchCompatibility(catalog, compatibilityInput.parse({ brand: 'BYD', model: 'Song Plus DM-i' }));
  assert.equal(variant.total, 0);
  const brandOnly = searchCompatibility(catalog, compatibilityInput.parse({ brand: 'BYD' }));
  assert.equal(brandOnly.exactCount, 0);
});

test('pagination keeps total and ordering without truncating results silently', () => {
  const { catalog } = fixture();
  const result = findCandidates(catalog, candidateInput.parse({ limit: 1, offset: 1 }));
  assert.equal(result.total, 2);
  assert.equal(result.items[0]!.id, 'test-apk');
  assert.equal(result.hasMore, false);
  assert(!candidateInput.safeParse({ limit: 100 }).success);
});

test('catalog rejects a mirror from another release and downloads on source-only projects', () => {
  const { catalog } = fixture();
  catalog.packages[1]!.mirror = { version: 'wrong-version', path: 'DiPlay/test', verifiedAt: '2026-10-01T00:00:00Z', shareUrl: 'https://example.com/share', qrUrl: 'https://example.com/qr', projectId: 'test-apk', assets: [] };
  assert(!catalogSchema.safeParse(catalog).success);
  catalog.packages[1]!.mirror = null;
  catalog.packages[2]!.downloads = [{ url: 'https://example.com/test.apk', filename: 'test.apk', sha256: null }];
  assert(!catalogSchema.safeParse(catalog).success);
});
