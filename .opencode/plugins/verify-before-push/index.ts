import { Plugin } from "@opencode/plugin";

/**
 * Verification chain that must pass before any `git push`.
 *
 * Mirrors the workflow rule "run lint + tests + type check before pushing".
 * Lint is intentionally NOT in the chain yet: `npm run lint` has a known
 * pre-existing failure baseline (8 `no-explicit-any` errors in
 * src/app/api/auth/[...nextauth]/route.ts), so gating on it would block every
 * push. Add `npm run lint && ` once that baseline is clean.
 */
const VERIFY = "npx tsc --noEmit && npx vitest run";

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
      event.timeout = Math.max(event.timeout, 300_000);
    });
  },
});
