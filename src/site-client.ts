import { createHash } from 'node:crypto';
import { catalogSchema, type Catalog } from './catalog.js';

export class SiteClient {
  readonly baseUrl: URL;
  private cached?: { catalog: Catalog; expiresAt: number };
  private pending?: Promise<Catalog>;

  constructor(baseUrl = 'https://diplay.org', private readonly fetcher: typeof fetch = fetch, private readonly cacheMs = 60_000) {
    this.baseUrl = new URL(baseUrl);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(this.baseUrl.hostname);
    if (this.baseUrl.username || this.baseUrl.password || this.baseUrl.search || this.baseUrl.hash || this.baseUrl.pathname !== '/') throw new Error('DIPLAY_SITE_URL must be an origin without credentials or a path');
    if (this.baseUrl.protocol !== 'https:' && !(local && this.baseUrl.protocol === 'http:')) throw new Error('DIPLAY_SITE_URL requires HTTPS, except on loopback for review');
  }

  private async read(route: string, format: 'json' | 'markdown') {
    const response = await this.fetcher(new URL(route, this.baseUrl), {
      signal: AbortSignal.timeout(10_000), redirect: 'error',
      headers: { accept: format === 'json' ? 'application/json' : 'text/markdown', 'user-agent': 'diplay-helper/0.1.0' },
    });
    if (!response.ok) throw new Error(`DiPlay source unavailable (${response.status}): ${route}`);
    const type = response.headers.get('content-type')?.split(';')[0]?.trim();
    if (format === 'json' ? type !== 'application/json' : !['text/markdown', 'text/plain'].includes(type ?? '')) throw new Error(`Unexpected source format: ${route}`);
    const maximum = format === 'json' ? 4_000_000 : 250_000;
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Empty source response');
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > maximum) throw new Error(`Source response exceeds size limit: ${route}`);
        chunks.push(chunk.value);
      }
    } finally {
      await reader.cancel();
    }
    return Buffer.concat(chunks).toString('utf8');
  }

  async catalog(force = false): Promise<Catalog> {
    if (!force && this.cached && this.cached.expiresAt > Date.now()) return this.cached.catalog;
    if (this.pending) return this.pending;
    this.pending = (async () => {
      const catalog = catalogSchema.parse(JSON.parse(await this.read('/api/ai/catalog.json', 'json')));
      this.cached = { catalog, expiresAt: Date.now() + this.cacheMs };
      return catalog;
    })();
    try { return await this.pending; } finally { this.pending = undefined; }
  }

  async guide(route: string) {
    let catalog = await this.catalog();
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!catalog.guides[route]) throw new Error('Unknown DiPlay guide');
      const markdown = await this.read(route, 'markdown');
      const digest = createHash('sha256').update(markdown).digest('hex');
      if (digest === catalog.guides[route]) return { catalog, markdown, url: new URL(route, this.baseUrl).href };
      if (!attempt) catalog = await this.catalog(true);
    }
    throw new Error('DiPlay catalog and live Markdown are from different revisions; try again after the website update completes');
  }

  async package(id: string) {
    const item = (await this.catalog()).packages.find((entry) => entry.id === id);
    if (!item) throw new Error('Unknown package; use find_candidates or the live community index');
    const document = await this.guide(item.guide);
    const current = document.catalog.packages.find((entry) => entry.id === id);
    if (!current || current.guide !== item.guide) throw new Error('Package changed during source refresh; retry the lookup');
    return { ...document, item: current };
  }
}
