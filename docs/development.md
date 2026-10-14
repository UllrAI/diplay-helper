# Development and MCP configuration

DiPlay Helper reads Markdown and query data published by diplay.org. The Skill can use live Markdown directly; the MCP additionally requires the site’s `/api/ai/catalog.json` source contract.

## Local review

Node 22.12+; Node 24 recommended.

```sh
gh repo clone UllrAI/diplay-helper
cd diplay-helper
npm ci
npm run check
npm test
npm run build
npm run package:skill
```

The website source PR must be built/deployed before its new catalog endpoint is available. For local review, build the website's review branch and run its preview, then point the MCP at that local origin:

```sh
# In the diplay.org checkout:
npm run build
npm run preview -- --host 127.0.0.1 --port 4332

# In this checkout:
DIPLAY_SITE_URL=http://127.0.0.1:4332 npm run verify:source
DIPLAY_SITE_URL=http://127.0.0.1:4332 PORT=4333 npm start
```

The MCP endpoint is `http://127.0.0.1:4333/mcp`. `verify:source` reads every current package's actual Markdown and exercises all four tools against that source. Synthetic test fixtures remain in `tests/` and are never included in Skill ZIPs or the deployed server.

If Astro reports that a preview is already running, reuse the printed origin instead of assuming the requested port started. Do not stop another user's preview process.

For a local stdio client, build first, then configure its MCP server entry with your actual absolute path:

```json
{
  "mcpServers": {
    "diplay-helper": {
      "command": "node",
      "args": ["/absolute/path/to/diplay-helper/dist/index.js", "--stdio"],
      "env": { "DIPLAY_SITE_URL": "http://127.0.0.1:4332" }
    }
  }
}
```

No private repository URL is presented as a publicly installable package. After public release, publish the tested skill install command and the actual deployed HTTPS MCP URL.

## Server configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `DIPLAY_SITE_URL` | `https://diplay.org` | Maintained website origin; HTTP is permitted only on loopback for review |
| `HOST` | `127.0.0.1` | Listener address; Docker uses `0.0.0.0` |
| `PORT` | `8080` | HTTP port |
| `MCP_PUBLIC_URL` | `http://127.0.0.1:PORT` | Canonical public origin; set the real HTTPS origin when deploying behind a proxy |

HTTP requests validate the public Host and any Origin header. Preserve the public Host when proxying. The entrypoint handles current and 2025-era MCP clients using the official SDK. stdio uses the same tools and source client.

- `/healthz`: process liveness; does not imply the data source is ready.
- `/readyz`: validates availability of the maintained catalog and reports its revision/dates.
- `/metrics`: aggregate success/error counts by tool only; no query text, vehicle details, IPs or user identifiers. Counters reset on process restart; scrape them into the deployment's monitoring system if durable totals are needed.

The Dockerfile builds a standalone server. It adds no GitHub Actions workflow. TLS, request-rate protection and readiness monitoring belong in the deployment/proxy configuration before opening the endpoint to the public.

## Validation

Behavior review: [review.md](review.md). Recorded checks: [validation.md](validation.md). Publication after review: [release.md](release.md).
