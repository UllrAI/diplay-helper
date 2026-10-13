import { createMcpHandler } from '@modelcontextprotocol/server';
import { createServer, helperVersion } from './mcp.js';
import { SiteClient } from './site-client.js';

export function createHttpApp(client: SiteClient, publicUrl: URL) {
  const counts = new Map<string, { succeeded: number; failed: number }>();
  const handler = createMcpHandler(() => createServer(client, (name, ok) => {
    const count = counts.get(name) ?? { succeeded: 0, failed: 0 };
    count[ok ? 'succeeded' : 'failed']++;
    counts.set(name, count);
  }), { maxRequestBodySize: 16_384 });
  return {
    close: handler.close,
    fetch: async (request: Request) => {
      const url = new URL(request.url);
      if (url.host !== publicUrl.host) return new Response('Invalid host', { status: 403 });
      const origin = request.headers.get('origin');
      if (origin && origin !== publicUrl.origin) return new Response('Invalid origin', { status: 403 });
      if (url.pathname === '/healthz' && request.method === 'GET') return Response.json({ status: 'ok', version: helperVersion });
      if (url.pathname === '/readyz' && request.method === 'GET') {
        try {
          const catalog = await client.catalog();
          return Response.json({ status: 'ready', version: helperVersion, revision: catalog.revision, reviewedAt: catalog.reviewedAt });
        } catch { return Response.json({ status: 'source-unavailable', version: helperVersion }, { status: 503 }); }
      }
      if (url.pathname === '/metrics' && request.method === 'GET') {
        const body = [...counts].flatMap(([tool, count]) => [
          `diplay_tool_calls_total{tool="${tool}",result="success"} ${count.succeeded}`,
          `diplay_tool_calls_total{tool="${tool}",result="error"} ${count.failed}`,
        ]).join('\n');
        return new Response(`# TYPE diplay_tool_calls_total counter\n${body}\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
      }
      if (url.pathname !== '/mcp') return new Response('Not found', { status: 404 });
      return handler.fetch(request);
    },
  };
}
