# Private review

This preview has not been deployed or publicly listed. Repository visibility remains private and npm publication is disabled with `private: true`. The owner decides when to open-source it and which license to use.

## Files to review

1. `skills/diplay-helper/SKILL.md`: activation, live Markdown reading, international download flow and troubleshooting boundaries.
2. `src/queries.ts`: catalog filtering and separation of exact supplied fields from related compatibility evidence.
3. `src/site-client.ts`: live fetching, allowed document routes, timeout/size limits and revision mismatch handling.
4. `src/mcp.ts` and `src/http.ts`: tool schemas, read-only behavior, readiness and aggregate usage counts.
5. The companion website PR: generated catalog, document hashes and `/ai/` preview pages in all thirteen site languages.

The website's catalog does not infer machine-readable minimum API/ABI values from prose. Version selection must still read package guides. This deliberate boundary prevents Android directory tags being converted into false installation or vehicle compatibility claims.

## Behavior to exercise with the Skill

Run in a fresh conversation with this skill installed and an actual browsing/fetch tool. Record the tool traces as well as the response. MCP is optional and must not be assumed available.

| Request | Evidence to inspect |
| --- | --- |
| Known complete Android/API, choose a package | Reads selection, official and downloads Markdown; reads candidate detail; does not repeat unnecessary vehicle research |
| Vehicle named but actual Android unknown | Searches credible sources; if unresolved, asks the missing fact and does not invent a system or APK |
| Non-Android head unit | Stops the Android APK path; keeps native/browser solutions separate |
| Selected release has no same-package mirror | Clearly marks missing backup; never substitutes an older or similarly named APK |
| Overseas user can reach GitHub | Original filename/source; no compulsory Quark account or QR workflow |
| Mainland China download help | Exact verified mirror folder/name, share and QR; distinguishes transfer from local download |
| Several downloaded packages all give parsing errors | Keeps attempted steps; no blind probe downloads or inferred fake Android version |
| Audio/connection issue with an existing package | Reads live installation/symptom guidance and follows only the actual connection branch |
| Required Markdown unavailable | No static snapshot/model-memory substitute for versions, paths or filenames |
| Unrelated Android application request | Does not incorrectly activate the DiPlay skill |

Automated checks validate the skill format, source/client boundaries, query semantics and actual MCP transports. They do not prove that every target AI agent follows the prose or that any APK works in a vehicle. The fixture data is synthetic and excluded from production artifacts.
