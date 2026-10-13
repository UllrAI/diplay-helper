import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import { serve } from '@hono/node-server';
import { Client, StreamableHTTPClientTransport, InMemoryTransport } from '@modelcontextprotocol/client';
import { createServer } from '../src/mcp.js';
import { createHttpApp } from '../src/http.js';
import { SiteClient } from '../src/site-client.js';
import { fixture } from './fixture.js';

test('MCP advertises four read-only tools and returns live source bodies', async () => {
  const data = fixture();
  const server = createServer(new SiteClient('https://diplay.org', data.fetcher));
  const client = new Client({ name: 'review-test', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((tool) => tool.name).sort(), ['find_candidates', 'get_guide', 'get_package', 'search_compatibility']);
    assert(tools.every((tool) => tool.annotations?.readOnlyHint));
    const guide = await client.callTool({ name: 'get_guide', arguments: { topic: 'selection' } });
    assert.equal(guide.structuredContent?.markdown, data.documents['/llm-guide/selection.md']);
    const item = await client.callTool({ name: 'get_package', arguments: { id: 'test-source' } });
    assert.equal((item.structuredContent?.package as { distribution: string }).distribution, 'source');
    const failure = await client.callTool({ name: 'get_package', arguments: { id: 'missing' } });
    assert.equal(failure.isError, true);
  } finally { await client.close(); await server.close(); }
});

test('HTTP client connects; invalid origins/hosts fail; tool counts contain no user data', async () => {
  const data = fixture();
  const publicUrl = new URL('http://127.0.0.1:0');
  const app = createHttpApp(new SiteClient('https://diplay.org', data.fetcher), publicUrl);
  const http = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 });
  if (!http.listening) await once(http, 'listening');
  const address = http.address();
  assert(address && typeof address !== 'string');
  publicUrl.port = String(address.port);
  const client = new Client({ name: 'http-review', version: '1.0.0' });
  try {
    await client.connect(new StreamableHTTPClientTransport(new URL('/mcp', publicUrl)));
    const result = await client.callTool({ name: 'find_candidates', arguments: { brand: 'BYD', android: '8.1' } });
    assert.equal(result.isError, undefined);
    assert.equal(result.structuredContent?.total, 2);
    await client.callTool({ name: 'get_package', arguments: { id: 'missing' } });
    const metrics = await (await fetch(new URL('/metrics', publicUrl))).text();
    assert(metrics.includes('tool="find_candidates",result="success"} 1'));
    assert(metrics.includes('tool="get_package",result="error"} 1'));
    assert(!metrics.includes('BYD') && !metrics.includes('8.1'));
    assert.equal((await fetch(new URL('/readyz', publicUrl))).status, 200);
    assert.equal((await fetch(new URL('/mcp', publicUrl), { method: 'POST', headers: { origin: 'https://evil.example' } })).status, 403);
    assert.equal((await app.fetch(new Request('http://evil.example/mcp', { method: 'POST' }))).status, 403);
    assert.equal((await fetch(new URL('/unknown', publicUrl))).status, 404);
  } finally {
    await client.close(); await app.close(); http.close(); http.closeAllConnections();
  }
});

test('readiness fails when the maintained source is unavailable', async () => {
  const app = createHttpApp(new SiteClient('https://diplay.org', async () => new Response('Unavailable', { status: 503 })), new URL('http://127.0.0.1'));
  try {
    assert.equal((await app.fetch(new Request('http://127.0.0.1/healthz'))).status, 200);
    assert.equal((await app.fetch(new Request('http://127.0.0.1/readyz'))).status, 503);
  } finally { await app.close(); }
});
