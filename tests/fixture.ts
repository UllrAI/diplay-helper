import { createHash } from 'node:crypto';
import type { Catalog } from '../src/catalog.js';

export const hash = (text: string) => createHash('sha256').update(text).digest('hex');
export function fixture() {
  const documents: Record<string, string> = {
    '/llm-guide.md': '# DiPlay test entry\nRead the task guides.\n',
    ...Object.fromEntries(['selection', 'official', 'community', 'downloads', 'installation', 'troubleshooting'].map((topic) => [`/llm-guide/${topic}.md`, `# DiPlay test ${topic}\nTest guidance.\n`])),
    '/llm-guide/community/test-apk.md': '# DiPlay test APK\nAndroid 8.1 only; vehicle testing unknown.\n',
    '/llm-guide/community/test-source.md': '# DiPlay test source\nNo public APK.\n',
  };
  const base = {
    name: 'Synthetic test package', brand: 'BYD', distribution: 'apk' as const, version: 'test-version',
    prerelease: null, androidTargets: ['8.1'], abi: null,
    target: { en: 'Test target', zh: '测试对象' }, summary: { en: 'Test only', zh: '仅测试' },
    limits: { en: 'No vehicle acceptance', zh: '没有实车验收' }, evidence: 'unknown',
    sources: ['https://example.com/test-evidence'], downloads: [], mirror: null,
  };
  const catalog: Catalog = {
    schemaVersion: 1, revision: hash('test-revision'), reviewedAt: { official: '2026-10-01', community: '2026-10-01' },
    guides: Object.fromEntries(Object.entries(documents).map(([path, text]) => [path, hash(text)])),
    packages: [
      { ...base, id: 'official', brand: 'Generic', androidTargets: [], guide: '/llm-guide/official.md' },
      { ...base, id: 'test-apk', guide: '/llm-guide/community/test-apk.md' },
      { ...base, id: 'test-source', distribution: 'source', guide: '/llm-guide/community/test-source.md' },
    ],
    compatibility: ['8.0', '8.1', null].map((android, index) => ({
      id: `report-${index}`, brand: 'BYD', model: 'Song Plus', year: 2023,
      headUnit: null, dilink: '4.0', android, soc: null, diplayVersion: 'tested-version',
      iphone: 'iPhone test', ios: 'test-ios', connection: 'both', wirelessMethod: 'car-hotspot',
      status: 'limited-evidence', evidenceLevel: 'community-reported',
      source: ['https://example.com/test-report'], sourceDate: '2026-10-01', lastVerified: '2026-10-01', reviewStatus: 'reviewed',
      carplay: 'working', audio: 'unknown', calls: 'unknown',
    })),
    modelAliases: { '宋plus': 'songplus', songplus: 'songplus' },
  };
  const fetcher: typeof fetch = async (input) => {
    const route = new URL(String(input)).pathname;
    if (route === '/api/ai/catalog.json') return Response.json(catalog);
    if (documents[route]) return new Response(documents[route], { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
    return new Response('Missing', { status: 404 });
  };
  return { documents, catalog, fetcher };
}
