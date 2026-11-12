# OWASP Top 10 mapping

How each category is checked by `scripts/security-check.mts`, and what a
legitimate false positive looks like in this codebase.

| Category | Automated check | Typical false positive | Verdict rule |
| --- | --- | --- | --- |
| A01 Broken Access Control | `src/proxy.ts` matcher covers every `src/app` route except `/`, `/login`, `/unauthorized`, `/api/auth` | A route group or API route protected by its own handler | Never suppress; fix the matcher or the handler |
| A02 Cryptographic Failures | Tracked `.env*`, secrets in the pushed diff, `NEXT_PUBLIC_*` with SECRET/TOKEN/PASSWORD/KEY, Semgrep `p/secrets` | Fake token in a test fixture | Only false if the fixture is clearly fake and excluded from scanning |
| A03 Injection | Semgrep OWASP/typescript/react + `eval`, `new Function`, `.innerHTML =`, `document.write`, `dangerouslySetInnerHTML` | Rule for SQL/PHP/nginx in a client component | False only when the sink or language does not apply |
| A04 Insecure Design | Manual | — | Escalate to a human |
| A05 Security Misconfiguration | Required headers wired from `src/config/security-headers.mjs` | Header added dynamically outside the shared module | Fix the shared module; do not suppress |
| A06 Vulnerable Components | `npm audit --omit=dev --audit-level=high` | Dev-only advisory in `@opencode/plugin`'s npm tooling | Production tree is what blocks; dev findings are reported but not gated |
| A07 Authentication Failures | `useSecureCookies` + required auth env validation in `route.ts` | — | Never suppress |
| A08 Software and Data Integrity | `package-lock.json` tracked, `npm install-scripts ls` clean | npm version without `install-scripts` support | WARN, not a suppression |
| A09 Security Logging | Manual | — | Escalate to a human |
| A10 SSRF | Semgrep SSRF rules; no server-side fetch of user URLs today | Rule for a server framework not used here | False only when no user-controlled URL reaches a fetch |

## Next.js-specific notes

- React escapes JSX text and attribute values. XSS requires an explicit raw-HTML
  sink; that is why A03 focuses on `dangerouslySetInnerHTML`, `innerHTML`,
  `eval`, `new Function`, and `document.write`.
- `src/proxy.ts` is the Next 16 middleware (formerly `middleware.ts`). Auth and
  scopes are enforced there, not in pages.
- `localStorage` currently stores only the selected project ID. It must never
  store access tokens or personal data; a finding about auth tokens in
  `localStorage` is a true positive if it appears.
- The CSP lives in `src/config/security-headers.mjs` and allows the API and
  Keycloak origins from the environment. If a new external origin is added,
  update that module instead of weakening the policy.
