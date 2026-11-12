---
name: Security Triage
description: Use when `npm run security` or the pre-push OWASP/Semgrep gate fails, to classify true vs false positives, fix real findings, and add justified suppressions.
---

# Security Triage — TaskForge360 UI

The pre-push hook runs `npm run security`. When it fails, the push is blocked.
This skill turns the findings into fixes or auditable false-positive
suppressions. Do not retry the push until `npm run security` exits 0.

## Inputs

1. The hook output (summary table A01–A10 and the first 50 findings).
2. `.security/report.json` — stable machine-readable report:
   - `checks`: one entry per OWASP category (`PASS`, `FAIL`, `WARN`, `MANUAL`).
   - `findings`: `{ category, ruleId, severity, file, line, message, source, verdict }`.
3. `.security/report.sarif` — raw Semgrep SARIF, when you need rule metadata.
4. `SECURITY.md` — policy and the suppression log.

If `.security/report.json` is missing or stale, run `npm run security` first.

## Workflow

1. **Read the report.** Group findings by `category` and `ruleId`. Ignore
   `MANUAL` categories for now; they need human review.
2. **Triage each finding** with the decision tree below. Do not batch-classify:
   each `file:line` gets its own verdict.
3. **Act on the verdict:**
   - `TRUE_POSITIVE`: fix the code. Add a regression test in the colocated
     `__tests__/` directory when behavior changes.
   - `FALSE_POSITIVE`: add an inline suppression on the exact line:
     ```ts
     // nosemgrep: <rule-id> -- <reason with evidence>
     ```
     Then add a row to the suppression log in `SECURITY.md`.
   - `NEEDS_HUMAN`: stop and report. Do not suppress.
4. **Re-run** `npm run security`. Repeat until it exits 0.
5. **Re-run** `npx tsc --noEmit` and `npx vitest run` if you changed code.
6. **Retry the push.** The hook re-runs the whole gate.

## Decision tree (apply in order)

1. **Does the rule apply to this stack?**
   A rule for nginx, SQL, PHP, or a server framework in a Next.js client file is
   not applicable → `FALSE_POSITIVE` (reason: rule not applicable).
2. **Is the flagged value attacker-controlled at a trust boundary?**
   Trust boundaries here: form fields, URL params, API responses, Keycloak
   tokens, `localStorage`, file uploads. If the value is a compile-time
   constant, an internal ID, or test data → `FALSE_POSITIVE` (reason: data is
   not attacker-controlled). Prove it by naming the source.
3. **Does an existing control fully neutralize the sink?**
   Examples: React auto-escaping for JSX text, the `src/proxy.ts` auth/scope
   check, `httpOnly` cookies, the CSP added in `next.config.ts`. The control
   must be on the path, not merely present in the repo. If it fully mitigates →
   `FALSE_POSITIVE` (reason: mitigated by X).
4. **Is the sink reachable with attacker-controlled data and no complete
   control?** → `TRUE_POSITIVE`.
5. **Unsure?** → `TRUE_POSITIVE` (fail closed) and escalate. Never guess in
   favor of suppression.

### Category-specific rules

- **A01 (access control)**: never suppress. A missing `config.matcher` entry or
  a missing scope check is always `TRUE_POSITIVE`.
- **A02 (secrets/crypto)**: never suppress a real credential. A fake token in a
  test is `FALSE_POSITIVE` only if the file is excluded by `.semgrepignore`;
  otherwise move the fake to a clearly named fixture.
- **A03 (injection/XSS)**: React escapes JSX by default. `dangerouslySetInnerHTML`,
  `eval`, `new Function`, `.innerHTML =`, and `document.write` are the real
  sinks; treat any of them with user data as `TRUE_POSITIVE`.
- **A05 (misconfiguration)**: the headers live in
  `src/config/security-headers.mjs`; fix the shared module, not the check.
- **A06 (dependencies)**: fix by upgrading within semver, or document a
  reachability-based deferral. Never run `npm audit fix --force`.
- **A07 (auth)**: never suppress. Fix `route.ts` or the environment.
- **A08 (integrity)**: keep `package-lock.json` tracked and install scripts
  reviewed.

## Suppression rules

A suppression is valid only when all of these are true:

- The exact rule ID is present in the report.
- The comment sits on the flagged line or the line immediately above it.
- The reason names the evidence (source, control, or stack mismatch), not just
  "false positive".
- `SECURITY.md` has a matching row: rule, file, reason, date, author.
- The category is not A01, A02, or A07 (those require human approval).

Never:

- Add a directory or file-wide exclusion to `.semgrepignore` for application
  code. It is only for generated/vendored paths and tests.
- Edit `scripts/security-check.mts`, `.semgrepignore`, the plugin, or the
  `security` scripts in `package.json` to make findings disappear.
- Lower a severity, remove a rule from the packs, or use `--no-verify`.
- Delete or weaken an existing test to get to green.

## Output

Report a table before retrying the push:

| Category | Rule | Location | Verdict | Evidence | Action |
| --- | --- | --- | --- | --- | --- |
| A03 | `javascript.lang.security...` | `src/...:42` | TRUE_POSITIVE | user input from form field | sanitize + test |

Then state the final `npm run security` result and, if applicable, the
suppression rows added to `SECURITY.md`.

## Definition of done

- `npm run security` exits 0.
- `npx tsc --noEmit` exits 0.
- `npx vitest run` is green.
- Every suppression has a reason and a `SECURITY.md` row.
- No blocking check was disabled or weakened.
