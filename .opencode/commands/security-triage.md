---
description: Triage the findings that blocked the pre-push OWASP/Semgrep gate
---

The pre-push security gate blocked a push. Load the `security-triage` skill
(skill id: `security-triage`) and follow it to process `.security/report.json`.

Classify every finding as TRUE_POSITIVE, FALSE_POSITIVE, or NEEDS_HUMAN, apply
the fix or the justified suppression, then re-run `npm run security` until it
exits 0. Do not retry the push before that.

$ARGUMENTS
