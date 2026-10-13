import assert from 'node:assert/strict';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { SiteClient } from '../src/site-client.js';
import { createServer } from '../src/mcp.js';

const source = new SiteClient(process.env.DIPLAY_SITE_URL);
const catalog = await source.catalog();
for (const topic of ['/llm-guide.md', '/llm-guide/selection.md', '/llm-guide/official.md', '/llm-guide/downloads.md', '/llm-guide/installation.md', '/llm-guide/troubleshooting.md']) await source.guide(topic);
for (const item of catalog.packages) await source.package(item.id);
const server = createServer(source);
const client = new Client({ name: 'source-verification', version: '1.0.0' });
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
await server.connect(serverTransport);
await client.connect(clientTransport);
try {
  for (const request of [
    { name: 'get_guide', arguments: { topic: 'entry' } },
    { name: 'find_candidates', arguments: { brand: 'BYD', android: '8.1' } },
    { name: 'get_package', arguments: { id: 'official' } },
    { name: 'search_compatibility', arguments: { brand: 'BYD', model: 'Song Plus' } },
  ]) {
    const result = await client.callTool(request);
    assert(!result.isError, `${request.name} failed`);
    assert.equal(result.structuredContent?.revision, catalog.revision);
  }
} finally { await client.close(); await server.close(); }
console.log(`Verified ${catalog.packages.length} package Markdown documents and all four MCP tools against ${source.baseUrl.origin}; revision ${catalog.revision}.`);
