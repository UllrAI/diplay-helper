# Release after owner review

Do not execute this release sequence before the owner approves publication. Creating this private preview is not permission to make the repository public, deploy a public endpoint or submit directory listings.

1. Review both repositories. Select an open-source license for the helper code/Skill and preserve original source attribution. Keep the website repository private.
2. Merge and deploy the companion website PR through the existing Zeabur Git deployment flow. Verify `/api/ai/catalog.json`, `/llm-guide.md`, package/topic Markdown and `/ai/` in production. Run `npm run verify:source` against `https://diplay.org`.
3. Deploy this repository as a separate service using its Dockerfile and an actual HTTPS domain. Configure `MCP_PUBLIC_URL`, preserve the public Host, and apply edge request-rate limits. Check `/healthz`, `/readyz`, Streamable HTTP tools and concurrent clients. Configure readiness monitoring; process liveness alone is insufficient.
4. After approval, change **only** `UllrAI/diplay-helper` to public. Publish a tagged release/Skill ZIP, add the public installation command to the website and README, and validate installation on the target agents. Keep private review instructions distinguishable from public installation instructions.
5. Generate Registry metadata locally with `npm run registry:prepare -- https://ACTUAL-DEPLOYED-HOST/mcp`. The script creates `dist/server.json` and sends nothing. Verify `org.diplay/helper` namespace control via HTTPS or DNS for diplay.org. Install/use the official `mcp-publisher`, validate the generated manifest, then publish only with the approved endpoint and now-public repository. No GitHub Actions workflow is required.
6. The Skill can be distributed independently of the MCP. Test the chosen skills CLI install path; skills.sh discovery follows its current installation/telemetry rules. Do not promise automatic listing. Add a plugin bundle or mandatory MCP dependency only if that distribution surface is chosen and the endpoint is actually deployed.
7. Observe actual listings, their indexed detail pages, destination links and link attributes. Compare directory referral visits, Skill installations and aggregate MCP query counts for 2–4 weeks. Website Umami does not count direct MCP tool calls. A download-link click does not establish APK download or vehicle installation success.

Registry remote configuration and schema: https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/remote-servers.mdx

Skill discovery mechanism: https://www.skills.sh/docs/faq
