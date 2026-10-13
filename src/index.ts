import { serve } from '@hono/node-server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createServer } from './mcp.js';
import { createHttpApp } from './http.js';
import { SiteClient } from './site-client.js';

const client = new SiteClient(process.env.DIPLAY_SITE_URL);
if (process.argv.includes('--stdio')) {
  const handle = serveStdio(() => createServer(client));
  process.once('SIGTERM', () => { void handle.close(); });
  process.once('SIGINT', () => { void handle.close(); });
} else {
  const port = Number(process.env.PORT ?? '8080');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535');
  const host = process.env.HOST ?? '127.0.0.1';
  const publicUrl = new URL(process.env.MCP_PUBLIC_URL ?? `http://127.0.0.1:${port}`);
  const app = createHttpApp(client, publicUrl);
  const server = serve({ fetch: app.fetch, hostname: host, port }, () => {
    console.error(`DiPlay helper listening at ${publicUrl.origin}/mcp`);
  });
  const shutdown = () => {
    server.close();
    if ('closeAllConnections' in server) server.closeAllConnections();
    void app.close();
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
