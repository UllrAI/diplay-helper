# Validation record

## Private preview — 2026-10-14

This section records the state before the owner approved publication.

- Skill frontmatter/name validation passed using the bundled skill-creator validator. The packaged ZIP contains only `SKILL.md` and `agents/openai.yaml`; there is no data catalog, release snapshot or offline Markdown knowledge copy.
- MCP TypeScript check and build passed. All 12 tests passed, including a real Streamable HTTP client connection, tool discovery, live guide results, mixed-revision handling, unavailable sources, minor-version/old-release boundaries, source-only projects and host/origin validation.
- Companion website: 71 tests passed; Astro reported zero errors, warnings or hints. Data/build verification passed for 457 content pages, with all thirteen AI integration translations, reciprocal hreflang, links and sitemap. The catalog is generated from the existing reviewed data.
- Actual local website integration passed using the existing preview at `http://127.0.0.1:4331`: all 117 current package/project Markdown documents and all four MCP tools were checked against revision `11235caf3e06fd49a8c9bf4991fe20924e9633852b681c4b7e7c0481b87a2ac6`. Catalog and entry returned `application/json` and `text/markdown` respectively. The existing preview process was reused and preserved. Live download Markdown was also updated to choose the original distribution or a verified mirror according to actual regional access, matching the new skill.
- Skill model-behavior review is still for the owner/target agents, following `docs/review.md`. Automated tests do not validate vehicle functionality or every agent's adherence to the skill.
- Docker image/runtime verification was not performed because the local Docker daemon was not running. Node runtime and actual HTTP MCP transport were tested. Production Nginx configuration and public TLS/proxy behavior remain deployment checks after owner review.
- Repository remains private. No public service deployment, npm publication, Registry submission, skills.sh listing or plugin-directory submission occurred.

## Public release — 2026-10-14

- Owner approved publication; the helper repository is public under MIT. The website repository remains private. No hosted MCP service, npm package or Registry entry was published.
- Helper check/build and all 12 tests passed. Skill validation passed; the release ZIP includes the instructions, agent metadata and MIT license, with no data snapshots.
- The documented public Skills CLI installation was exercised in an isolated temporary project for Codex. The installed SKILL.md matched the source; no user-global Skill installation was replaced.
- The companion website PR was merged and its exact commit `44feea75dbfd26bfac8dc16f2c108c55219c9fc5` reached Zeabur RUNNING. Production catalog returned HTTP 200 with `application/json`; the integration page returned HTTP 200.
- `npm run verify:source` passed against `https://diplay.org`: 127 live package/project Markdown documents and all four MCP tools matched revision `274191fb15aae2ea5046c1132fcc3b4833baac3913416db3eab9a3d032525997`.
- A separate stdio MCP server process connected to a real client, advertised four tools and completed each against the same production revision. The client closed the process afterward.
- Cross-agent behavior and physical vehicle tests remain separate from installation, transport and source-contract checks. The Docker daemon limitation from the private preview still applies; no hosted HTTPS endpoint has been validated.
