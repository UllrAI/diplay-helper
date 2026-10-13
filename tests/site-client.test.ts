import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SiteClient } from '../src/site-client.js';
import { fixture, hash } from './fixture.js';

test('package body is read live and an unknown path never becomes a fetch target', async () => {
  const { fetcher, documents } = fixture();
  const calls: string[] = [];
  const client = new SiteClient('https://diplay.org', async (...args) => { calls.push(String(args[0])); return fetcher(...args); });
  const item = await client.package('test-apk');
  assert.equal(item.markdown, documents['/llm-guide/community/test-apk.md']);
  assert(calls.some((url) => url.endsWith('/llm-guide/community/test-apk.md')));
  const before = calls.length;
  await assert.rejects(client.guide('/llm-guide/../../private.md'), /Unknown/);
  assert.equal(calls.length, before);
  await assert.rejects(client.package('missing'), /Unknown package/);
});

test('a source update refreshes catalog and Markdown together', async () => {
  const data = fixture();
  let catalogReads = 0;
  const client = new SiteClient('https://diplay.org', async (input, init) => {
    if (String(input).endsWith('/api/ai/catalog.json')) catalogReads++;
    return data.fetcher(input, init);
  });
  await client.catalog();
  data.documents['/llm-guide/official.md'] = '# DiPlay new synthetic release\n';
  data.catalog.guides['/llm-guide/official.md'] = hash(data.documents['/llm-guide/official.md']);
  data.catalog.revision = hash('new-revision');
  const result = await client.guide('/llm-guide/official.md');
  assert.equal(result.catalog.revision, data.catalog.revision);
  assert.equal(result.markdown, data.documents['/llm-guide/official.md']);
  assert.equal(catalogReads, 2);
});

test('persistent mixed revisions fail instead of presenting a mismatched package', async () => {
  const data = fixture();
  data.documents['/llm-guide/official.md'] = '# DiPlay unmatched document\n';
  const client = new SiteClient('https://diplay.org', data.fetcher);
  await assert.rejects(client.package('official'), /different revisions/);
});

test('expired cache is not an offline data fallback', async () => {
  const data = fixture();
  let unavailable = false;
  const client = new SiteClient('https://diplay.org', async (...args) => unavailable ? new Response('Unavailable', { status: 503 }) : data.fetcher(...args), 0);
  await client.catalog();
  unavailable = true;
  await assert.rejects(client.catalog(), /503/);
});

test('HTML error pages, redirects and oversized documents cannot be read as guidance', async () => {
  const data = fixture();
  const client = new SiteClient('https://diplay.org', async (input, init) => String(input).endsWith('/api/ai/catalog.json') ? data.fetcher(input, init) : new Response('<html>error</html>', { headers: { 'content-type': 'text/html' } }));
  await assert.rejects(client.guide('/llm-guide.md'), /format/);
  const large = new SiteClient('https://diplay.org', async (input, init) => String(input).endsWith('/api/ai/catalog.json') ? data.fetcher(input, init) : new Response('x'.repeat(250_001), { headers: { 'content-type': 'text/markdown' } }));
  await assert.rejects(large.guide('/llm-guide.md'), /size limit/);
  assert.throws(() => new SiteClient('http://example.com'), /HTTPS/);
  assert.throws(() => new SiteClient('https://user:password@example.com'), /credentials/);
});
