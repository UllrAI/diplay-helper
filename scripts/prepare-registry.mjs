import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';

const endpoint = process.argv[2];
if (!endpoint) throw new Error('After review and deployment: npm run registry:prepare -- https://YOUR-DEPLOYED-HOST/mcp');
const url = new URL(endpoint);
if (url.protocol !== 'https:' || url.pathname !== '/mcp' || url.username || url.password || url.search || url.hash) throw new Error('Supply the deployed HTTPS /mcp endpoint without credentials or query parameters');
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const manifest = {
  $schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
  name: 'org.diplay/helper', title: 'DiPlay Helper',
  description: 'Read-only DiPlay package lookup, compatibility evidence and live installation/troubleshooting guides.',
  websiteUrl: 'https://diplay.org/ai/',
  repository: { url: 'https://github.com/UllrAI/diplay-helper', source: 'github' },
  version, remotes: [{ type: 'streamable-http', url: url.href }],
};
await mkdir('dist', { recursive: true });
await writeFile('dist/server.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log('Prepared dist/server.json locally. Nothing was published. Review, verify domain ownership and run mcp-publisher validate before publication.');
