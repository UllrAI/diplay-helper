# Public distribution — 2026-10-14

Repository: [UllrAI/diplay-helper](https://github.com/UllrAI/diplay-helper), public under MIT. First release: [v0.1.0](https://github.com/UllrAI/diplay-helper/releases/tag/v0.1.0), including the Skill ZIP.

```sh
npx skills add UllrAI/diplay-helper --skill diplay-helper
```

The Skill reads live task-specific Markdown. MCP is an optional self-run TypeScript server with stdio and HTTP transports; no hosted endpoint, npm package or MCP Registry entry is advertised.

## Recommendations submitted

| Destination | Submission | Verified state on 2026-10-14 |
| --- | --- | --- |
| heilcheng/awesome-agent-skills | [PR #587](https://github.com/heilcheng/awesome-agent-skills/pull/587) | Open; awaiting maintainer review. Local website build passed. The destination's Vercel preview requires its team to authorize this external contribution. |
| libukai/awesome-agent-skills | [PR #194](https://github.com/libukai/awesome-agent-skills/pull/194) | Open; awaiting maintainer review. One entry under product use. |
| shihabal3amri/DiPlay | [Resource proposal #760](https://github.com/shihabal3amri/DiPlay/issues/760) | Open; proposed an optional third-party resource without implying endorsement or broader vehicle support. |
| wong2/awesome-mcp-servers → mcpservers.org | [Official submission form](https://mcpservers.org/submit) | Free submission completed; confirmation states review can take up to two weeks. No listing acceptance yet. |
| Sagargupta16/awesome-mcp-servers | [PR #176](https://github.com/Sagargupta16/awesome-mcp-servers/pull/176) | Merged on 2026-10-14 after all CI checks passed. The main README contains the DiPlay Helper entry under Search & Knowledge. The directory website has not been separately verified. |
| skillmatic-ai/awesome-agent-skills | [PR #203](https://github.com/skillmatic-ai/awesome-agent-skills/pull/203) | Open; proposes the original live-guide Skill as a concrete implementation example under How to Build Skills, without a duplicate copy. |
| serein-morii/DiPlay-CN | [Resource proposal #19](https://github.com/serein-morii/DiPlay-CN/issues/19) | Open; explains CN package identity, original GitHub/Gitee sources and scoped device evidence. |
| programmerguohuajing/DiPlay-Legacy-Android | [Resource proposal #159](https://github.com/programmerguohuajing/DiPlay-Legacy-Android/issues/159) | Open; explains actual Android/API/ABI, separate experimental builds and stage-specific troubleshooting. |

![MCP directory submission confirmation](distribution/mcpservers-submission.png)

The form used the project's public contact `feedback@diplay.org`. No paid submission was selected; the remote-endpoint checkbox and optional Registry name were left empty.

## Destinations not submitted

- VoltAgent/awesome-agent-skills requires proven community use and excludes newly created skills; defer until there is real usage evidence.
- appcypher/awesome-mcp-servers: a README entry was prepared and pushed to a fork, but GitHub rejected creation of the upstream PR with a permission error. No recommendation PR exists there.
- punkpeye/awesome-mcp-servers currently checks for a Glama evaluation link. No unverified badge or quality score was added.
- wong2/awesome-mcp-servers does not accept PRs; its README directs authors to the submission form, which was used instead.

A submitted PR or form is not accepted, indexed or proven to drive traffic. Future checks should use the actual merged entries, indexed detail pages and referral/install counts. No follow-up automation was created.

## Additional review on 2026-10-14

Four additional recommendations were submitted after checking relevance, contribution rules and duplicates. The MCP directory's local format, submission-quality and new-link checks passed, followed by every upstream PR check and its merge. Its sole local validator note was pre-existing order of Google Calendar/Zovo; no unrelated row was changed.

Production source verification was rerun before submission: all 127 package/project Markdown documents and all four MCP tools matched revision `274191fb15aae2ea5046c1132fcc3b4833baac3913416db3eab9a3d032525997`. The original two Skill PRs and DiPlay issue #760 were rechecked and remained open. The MCP Servers form still has a submission receipt; acceptance has not been independently confirmed.

Further candidates were screened out rather than sent generic requests: JackyST0/awesome-agent-skills currently requires 64 stars for community projects; Prat011/awesome-llm-skills asks for a copied skill folder and cross-agent behavior testing not established by the helper's installation/source checks. No stars, usage, endorsement or cross-agent results were invented to meet these rules.

Only the helper's public distribution record changed locally. Temporary submission checkouts are disposable after their branch commits and PRs have been pushed; branches supporting open PRs remain. No new hosted deployment, package publication, Registry submission or follow-up automation was performed.
