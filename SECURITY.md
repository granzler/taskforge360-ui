# Security policy

This project runs an OWASP Top 10 gate before every push issued from OpenCode.
The gate is implemented in `scripts/security-check.mts` and wired into the
`verify-before-push` plugin.

## Run it

```bash
npm run security            # full gate (Semgrep + audit + repo checks)
npm run security:semgrep    # Semgrep only, human-readable
npm run security:audit      # production dependency audit only
```

Requirements: `semgrep` must be on `PATH` (`pipx install semgrep`). The first
run downloads the registry packs and needs network access; they are cached in
`~/.semgrep` afterwards.

## What blocks a push

| Category | Blocking check |
| --- | --- |
| A01 Broken Access Control | Every `src/app` route is covered by `src/proxy.ts` `config.matcher`, except `/`, `/login`, `/unauthorized`, `/api/auth` |
| A02 Cryptographic Failures | No tracked `.env*`, no secrets in the pushed diff, no sensitive `NEXT_PUBLIC_*` variables, Semgrep `p/secrets` |
| A03 Injection | Semgrep OWASP/typescript/react, plus `eval`, `new Function`, `.innerHTML =`, `document.write`, `dangerouslySetInnerHTML` |
| A05 Security Misconfiguration | Security headers configured in `src/config/security-headers.mjs` and wired in `next.config.ts` |
| A06 Vulnerable Components | `npm audit --omit=dev --audit-level=high` has no high/critical findings |
| A07 Authentication Failures | `useSecureCookies` in production and required auth env vars validated |
| A08 Software and Data Integrity | `package-lock.json` tracked and no unreviewed install scripts |

A04 (insecure design), A09 (security logging), and A10 (SSRF) are reported as
`MANUAL`; they need human review. Semgrep still reports SSRF rules under A10.

Findings are written to `.security/report.json` (ignored by git). When the gate
fails, load the `security-triage` skill or run `/security-triage` to classify
each finding as a true or false positive, fix it, and re-run the gate.

## Severity policy

- Semgrep `ERROR` and `WARNING` findings block.
- `INFO` findings are not requested from Semgrep.
- `npm audit` blocks on high/critical in the production dependency tree only.
  Dev-only advisories are reported by `npm audit` but do not block.

## Suppressions

A false positive is accepted only with an inline suppression on the exact line:

```ts
// nosemgrep: <rule-id> -- <reason with evidence>
```

and a matching row here. A01, A02, and A07 suppressions require human approval.
Never use `--no-verify`, never exclude application directories in
`.semgrepignore`, and never weaken this policy or the gate to get a push
through.

## Suppression log

| Date | Rule | File | Reason | Author |
| --- | --- | --- | --- | --- |
| — | — | — | No suppressions yet | — |
