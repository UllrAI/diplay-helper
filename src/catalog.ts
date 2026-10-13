import { z } from 'zod';

const copy = z.object({ en: z.string(), zh: z.string() });
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const guidePath = z.string().regex(/^\/llm-guide(?:\.md|\/(?:community\/)?[a-z0-9-]+\.md)$/);
const nullableText = z.string().nullable();
const download = z.object({ url: z.url(), filename: z.string(), sha256: hash.nullable() });
const asset = z.object({
  filename: z.string(), upstreamFilename: z.string(), upstreamUrl: z.url(),
  sha256: hash, bytes: z.number().int().positive(), verification: z.string(),
});
const mirrorBase = {
  version: nullableText, path: z.string(), verifiedAt: z.iso.datetime({ offset: true }),
  shareUrl: z.url(), qrUrl: z.url(),
};
const mirror = z.union([
  z.object({ ...mirrorBase, filename: z.string(), upstreamUrl: z.url(), sha256: hash, bytes: z.number(), verification: z.string() }),
  z.object({ ...mirrorBase, projectId: z.string(), assets: z.array(asset) }),
]);
export const packageSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), name: z.string(), brand: z.string(),
  distribution: z.enum(['apk', 'source', 'channel']), version: nullableText,
  prerelease: z.boolean().nullable(), androidTargets: z.array(z.string()), abi: nullableText,
  target: copy, summary: copy, limits: copy, evidence: z.string(), sources: z.array(z.url()),
  guide: guidePath, downloads: z.array(download), mirror: mirror.nullable(),
});
export const compatibilitySchema = z.object({
  id: z.string(), brand: nullableText, model: nullableText, year: z.number().nullable(),
  headUnit: nullableText, dilink: nullableText, android: nullableText, soc: nullableText,
  diplayVersion: nullableText, iphone: nullableText, ios: nullableText,
  connection: nullableText, wirelessMethod: nullableText,
  status: z.enum(['confirmed-working', 'known-issues', 'limited-evidence', 'reported-incompatible', 'untested']),
  evidenceLevel: z.string(), source: z.array(z.url()), sourceDate: z.iso.date(), lastVerified: z.iso.date(),
  reviewStatus: z.literal('reviewed'),
}).passthrough();
export const catalogSchema = z.object({
  schemaVersion: z.literal(1), revision: hash,
  reviewedAt: z.object({ official: z.iso.date(), community: z.iso.date() }),
  guides: z.record(guidePath, hash), packages: z.array(packageSchema),
  compatibility: z.array(compatibilitySchema), modelAliases: z.record(z.string(), z.string()),
}).superRefine((catalog, ctx) => {
  const ids = new Set<string>();
  for (const item of catalog.packages) {
    if (ids.has(item.id) || !catalog.guides[item.guide]) ctx.addIssue({ code: 'custom', message: 'Duplicate package or missing guide' });
    ids.add(item.id);
    if (item.mirror && item.mirror.version !== item.version) ctx.addIssue({ code: 'custom', message: 'Mirror version does not match package' });
    if (item.distribution === 'source' && (item.downloads.length || item.mirror)) ctx.addIssue({ code: 'custom', message: 'Source-only project cannot have APK downloads' });
  }
  for (const route of ['/llm-guide.md', '/llm-guide/selection.md', '/llm-guide/official.md', '/llm-guide/downloads.md']) {
    if (!catalog.guides[route]) ctx.addIssue({ code: 'custom', message: 'Required live guide is missing' });
  }
});
export type Catalog = z.infer<typeof catalogSchema>;
export type Package = z.infer<typeof packageSchema>;
