# Releases and distribution

The owner approved opening `UllrAI/diplay-helper` under MIT, publishing the Skill, submitting relevant community recommendations, and merging/deploying the companion website catalog. The website repository remains private. This approval does not include a new hosted MCP service or npm package publication.

## Skill and self-run MCP

1. Run the helper checks and validate the Skill frontmatter. Rebuild the Skill ZIP; it contains instructions, agent metadata and the license, with no knowledge snapshots.
2. Verify production `/api/ai/catalog.json`, `/llm-guide.md` and `/ai/`. Run `npm run verify:source` against `https://diplay.org`; every package document and all four MCP tools must pass against one revision.
3. Make only the helper repository public. Verify the documented Skills CLI install command in an isolated project. Publish a tagged release with its Skill ZIP. Keep `private: true` in package.json to prevent accidental npm publication.
4. Recommend the Skill/MCP to appropriate repositories according to their contribution rules. Check for duplicate submissions and preserve original developer/source attribution. Describe MCP as a self-run server, without claiming a hosted endpoint or Registry listing. Record submitted and accepted states separately.

## Optional future hosted service

A hosted service requires its own owner-approved deployment. Use an actual HTTPS domain, configure `MCP_PUBLIC_URL`, preserve the public Host, and apply edge request-rate limits. Check `/healthz`, `/readyz`, Streamable HTTP tools and concurrent clients; process liveness alone is insufficient.

Only after that service exists, generate Registry metadata locally with `npm run registry:prepare -- https://ACTUAL-DEPLOYED-HOST/mcp`. The script creates `dist/server.json` and sends nothing. Verify `org.diplay/helper` namespace control through HTTPS or DNS, use the official `mcp-publisher`, validate the manifest and publish with the approved endpoint. No GitHub Actions workflow is required.

The Skill works independently of hosted MCP. skills.sh discovery follows its current installation/telemetry rules; installation does not prove a directory has accepted or indexed the Skill. Directory referral visits, Skill installations and MCP tool counts measure different things. Website analytics do not count direct MCP calls, and a download click does not prove vehicle installation success.

Registry schema: https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/remote-servers.mdx

Skills CLI: https://github.com/vercel-labs/skills
