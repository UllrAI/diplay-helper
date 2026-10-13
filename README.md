# DiPlay Helper

DiPlay package selection, downloads, installation, connection and troubleshooting, guided by the live Markdown at [diplay.org](https://diplay.org/llm-guide.md).

**Private review preview.** This repository is private under UllrAI. It has not been submitted to MCP Registry, skills.sh or a plugin directory. No public MCP endpoint or open-source license has been released. Make it public only after the owner's review.

## Skill

The skill is [`skills/diplay-helper/SKILL.md`](skills/diplay-helper/SKILL.md), displayed as **DiPlay Helper**. It replies in the user's language and covers more than version selection.

It reads the live entry, selection, official release, chosen project, download and relevant troubleshooting Markdown. It contains no catalog JSON, fixed release list or offline knowledge snapshots. If required live documents cannot be read, it identifies the missing evidence instead of inventing a package or using stale bundled data. Existing documents may be reused within a conversation; package changes, source updates and requests for the latest information trigger a refresh.

Use the skill with the agent's existing browser/fetch capabilities. MCP is optional. For private review, copy the `skills/diplay-helper` folder to the skill location your agent supports; in Codex this is `~/.codex/skills/diplay-helper`. Do not overwrite an existing local skill without checking it first. Start a new conversation and invoke `$diplay-helper`.

Examples:

- “Help me choose DiPlay for my BYD. My actual head-unit Android version is 8.1 / API 27.”
- “I already downloaded the APK; opening it says there was a problem parsing the package.”
- “CarPlay connects, but Siri audio is broken. Help me troubleshoot the current package.”
- “帮我给车机装 DiPlay；这是完整车型和系统信息。”

The original distribution is preferred where accessible. Mainland China or slow GitHub access can use a verified same-package Quark mirror, with exact folder, filename, share URL and QR image. Mirror transfer and local download are separate steps.

## MCP

The MCP reads the website's build-generated `/api/ai/catalog.json` and fetches package/topic Markdown live. The catalog is generated from the site's existing reviewed data; this repository does not maintain or ship a second release database. Guide hashes detect catalog/document revision mismatches during updates. A mismatch refreshes once, then fails clearly; an expired cache is not used as an offline fallback.

| Tool | Result |
| --- | --- |
| `find_candidates` | Current public APK candidates filtered by catalog brand/Android target tags, with explicit review requirements |
| `get_package` | The current package record, exact known downloads/mirror, and its live Markdown body |
| `search_compatibility` | Individual source reports, dates, evidence, exact supplied-field matches and related records |
| `get_guide` | Live entry, selection, official, community, downloads, installation or troubleshooting Markdown |

`find_candidates` is a catalog filter, not an API/ABI eligibility engine. Official minimums and adaptation requirements must be read from the live package guides. Tags, source builds, old tests, sparse fields and brand matches do not prove current vehicle compatibility. The current original release uses package ID `official`; it is never automatically called compatible merely because it appears in results. Source-only and channel projects are excluded from APK candidate search, but remain accessible through the community guide and `get_package` with their distribution preserved.

Brand filters use the catalog labels (for example `BYD`, `Geely`, `LynkCo`, `Generic`). Compatibility model queries reuse the website's reviewed spelling aliases without merging variants or markets. All four tools are read-only and require no model API key. They do not upload logs, install APKs, control a vehicle or send messages.

### Local review

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

### Server configuration

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

## Review and release

See [`docs/review.md`](docs/review.md) for behavior review and [`docs/release.md`](docs/release.md) for the staged release procedure. Site-side source files stay in the existing private website repository; the new repository contains only the Skill and MCP integration.

## 中文说明

技能名为 `diplay-helper`，展示名为 **DiPlay Helper**。它解决选包、下载、安装、连接和排错，按用户语言回复，并通过本站 LLM Markdown 获取最新知识；不包含静态资料快照。MCP 是可选的精确查询辅助，查到候选后仍要读对应 Markdown。

当前仓库保持私有，待 owner review 后再决定公开、许可证、部署和目录提交。网站改动也保留在 review 分支，尚未上线。原有 QAgent 专用 `diplay-version-helper` 是已发布接口，这次不改变其线上装配或覆盖已有本地安装。
