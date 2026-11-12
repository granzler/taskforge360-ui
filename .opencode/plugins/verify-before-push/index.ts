import { Plugin } from "@opencode/plugin";

/**
 * Verification chain that must pass before any `git push`.
 *
 * Mirrors the workflow rule "run lint + tests + type check before pushing".
 *
 * `npm run security` is the OWASP Top 10 gate (Semgrep + npm audit + repo
 * checks). When it fails, the push never runs and the failure points the agent
 * at the `security-triage` skill.
 */
const VERIFY =
  "npm run lint && npx tsc --noEmit && npx vitest run && npm run security";

/** Matches `git push` at the start of the command or after &&, ||, or ; */
const PUSH_PATTERN = /(^|&&|\|\||;)\s*git\s+push\b/;

export default Plugin.define({
  id: "verify-before-push",
  async setup(ctx) {
    await ctx.shell.hook("create.before", (event) => {
      const command = event.command.trim();
      if (!PUSH_PATTERN.test(command) || command.startsWith(VERIFY)) return;

      // Prefix the chain so the push only runs when verification is green.
      event.command = `${VERIFY} && ${event.command}`;
      event.timeout = Math.max(event.timeout, 600_000);
    });
  },
});
