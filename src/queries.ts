import { z } from 'zod';
import type { Catalog } from './catalog.js';

const text = z.string().trim().min(1).max(120);
const page = { offset: z.number().int().min(0).default(0), limit: z.number().int().min(1).max(50).default(20) };
export const candidateInput = z.object({
  brand: text.optional(), android: z.string().regex(/^\d+(?:\.\d+){0,2}$/).optional(),
  ...page,
}).strict();
export const compatibilityInput = z.object({
  brand: text, model: text.optional(), year: z.number().int().min(1990).max(2100).optional(),
  headUnit: text.optional(), dilink: text.optional(), android: text.optional(), iphone: text.optional(),
  ios: text.optional(), connection: z.enum(['wired', 'wireless']).optional(),
  wirelessMethod: z.enum(['car-hotspot', 'wifi-direct']).optional(), diplayVersion: text.optional(), ...page,
}).strict();
const normal = (value: string) => value.trim().toLowerCase();
const token = (value: string) => normal(value).replace(/[\s_-]+/g, '');

export function findCandidates(catalog: Catalog, input: z.infer<typeof candidateInput>) {
  const filtered = catalog.packages.filter((item) => {
    if (item.distribution !== 'apk') return false;
    // Official requirements live in the guide; catalog tags never establish eligibility.
    if (item.id === 'official') return true;
    if (input.brand && ![normal(input.brand), 'generic'].includes(normal(item.brand))) return false;
    const android = input.android;
    if (!android) return true;
    return item.androidTargets.some((target) => {
      if (target === '9+') return Number(android.split('.')[0]) >= 9;
      return target.includes('.') ? android === target : android.split('.')[0] === target;
    });
  });
  return {
    items: filtered.slice(input.offset, input.offset + input.limit).map(({ mirror, downloads, ...item }) => ({
      ...item, selectionStatus: 'requires-guide-review',
      matchBasis: item.id === 'official' ? 'Official candidate; installation requirements have not been evaluated' : 'Catalog target tags only; read target, firmware, API and ABI evidence before recommending',
    })),
    total: filtered.length, offset: input.offset, hasMore: input.offset + input.limit < filtered.length,
    requiredGuides: ['/llm-guide/selection.md', '/llm-guide/official.md', '/llm-guide/downloads.md'],
    warning: 'Candidates are not installation or vehicle compatibility confirmations. Source-only and channel projects are excluded; read community.md for those projects. Download details require get_package.',
  };
}

export function searchCompatibility(catalog: Catalog, input: z.infer<typeof compatibilityInput>) {
  const normalizeModel = (value: string) => catalog.modelAliases[token(value)] ?? token(value);
  const { offset, limit, ...query } = input;
  const records = catalog.compatibility.filter((record) => record.brand !== null && normal(record.brand) === normal(query.brand));
  const matches = (actual: unknown, wanted: string | number, key: string) => {
    if (actual === null || actual === undefined) return false;
    if (key === 'model') return normalizeModel(String(actual)) === normalizeModel(String(wanted));
    if (key === 'connection' && actual === 'both') return true;
    return normal(String(actual)) === normal(String(wanted));
  };
  const exact = query.model ? records.filter((record) => Object.entries(query).every(([key, wanted]) => matches(record[key], wanted, key))) : [];
  const related = records.filter((record) => !exact.includes(record) && (
    query.model ? record.model !== null && normalizeModel(record.model) === normalizeModel(query.model)
      || record.model === null && query.dilink !== undefined && matches(record.dilink, query.dilink, 'dilink') : true
  ));
  const combined = [...exact.map((record) => ({ match: 'exact-provided-fields', record })), ...related.map((record) => ({ match: 'related-only', record }))];
  const missing = ['model', 'dilink', 'android', 'iphone', 'ios', 'connection', 'diplayVersion'].filter((key) => query[key as keyof typeof query] === undefined);
  return {
    items: combined.slice(offset, offset + limit), total: combined.length, exactCount: exact.length,
    relatedCount: related.length, offset, hasMore: offset + limit < combined.length,
    missingComparisonFields: missing,
    warning: 'Exact means only the supplied fields match. Keep each report’s version, firmware, source date and evidence level. Related reports, unknown fields and older releases do not confirm the user’s current setup. No aggregate success claim is inferred.',
  };
}
