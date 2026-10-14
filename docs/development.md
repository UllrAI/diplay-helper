# Development and MCP configuration

DiPlay Helper reads Markdown and query data published by diplay.org. The Skill can use live Markdown directly; the MCP additionally requires the site’s `/api/ai/catalog.json` source contract.

## Run the MCP locally

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

After building, a stdio MCP client can start the server against `https://diplay.org`, the default live source. Replace the path with your actual checkout location:

```json
{
  "mcpServers": {
    "diplay-helper": {
      "command": "node",
      "args": ["/absolute/path/to/diplay-helper/dist/index.js", "--stdio"]
    }
  }
}
```

To check the live source and every tool, or run local HTTP:

```sh
npm run verify:source
PORT=4333 npm start
```

The local HTTP endpoint is `http://127.0.0.1:4333/mcp`. `verify:source` reads every current package's actual Markdown and exercises all four tools against that source. Synthetic test fixtures remain in `tests/` and are never included in Skill ZIPs or the deployed server.

For companion website development, build its review branch and start its preview. Point the helper to the actual printed origin using `DIPLAY_SITE_URL=http://127.0.0.1:4332`. If Astro reports an existing preview, reuse its origin; do not stop another user's process. This override also works in the stdio client's `env` configuration.

No hosted MCP endpoint is provided. HTTP hosting is separate from installing this Skill or running the MCP locally.

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
