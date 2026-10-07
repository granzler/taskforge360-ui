# AGENTS.md — TaskForge360 UI

Task management frontend. Next.js 16 (App Router) + React 19 + TypeScript strict +
Tailwind 4 + TanStack Query 5 + next-auth v4 with Keycloak. Single-package repo (npm,
`package-lock.json` — don't use yarn/pnpm). The .NET backend lives in a separate repo.

## Commands (verified)

```bash
npm ci                 # install dependencies (node_modules is not committed)
npm run dev            # dev server on :3000 (Turbopack)
npx tsc --noEmit       # typecheck — there is NO script for this
npm run lint           # ESLint (flat config)
npx vitest run         # run tests once (CI/verification)
npx vitest run src/features/backlog/hooks/__tests__/useCreateWorkItem.test.ts   # single test
npx vitest --ui        # Vitest UI
```

- `npm run test` leaves Vitest in **watch mode**; use `npx vitest run` to verify.
- Verification order before committing: `npm run lint` → `npx tsc --noEmit` → `npx vitest run`.
- **`npm run lint` already fails on main**: 8 pre-existing `@typescript-eslint/no-explicit-any`
  errors in `src/app/api/auth/[...nextauth]/route.ts` (plus warnings). Don't "fix" them in
  unrelated changes; just make sure you don't add new errors.
- Since `eslint-config-next@16.4.0`, `react-hooks/set-state-in-effect` is downgraded to
  `warn` in `eslint.config.mjs`: the existing "reset state from props in an effect" patterns
  predate the rule. New code should avoid that pattern.
- `tsc --noEmit` and all 41 tests (5 files) pass clean on main.
- There is no CI (`.github/` does not exist).

## Environment

- Requires `.env`. The README lists the variables but **`.env.example` does not exist**
  (`.gitignore` ignores `.env*`): `NEXT_PUBLIC_API_URL`, `KEYCLOAK_ID`,
  `KEYCLOAK_SECRET`, `KEYCLOAK_ISSUER`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
- `NEXT_PUBLIC_API_URL` points at the .NET backend (default `https://localhost:7157/`);
  without the backend, pages that call the API will fail.
- Auth: Keycloak via next-auth v4 in `src/app/api/auth/[...nextauth]/route.ts`. The JWT is
  decoded in the `jwt` callback to extract `roles` (realm + client) and `scopes`;
  `src/types/next-auth.d.ts` extends the session with `accessToken`, `roles`, `scopes`.
- `npm run dev` includes `NODE_OPTIONS='--no-deprecation'` **on purpose** (suppresses
  DEP0205 from `module.register()` in Turbopack/Node 26). Don't remove it.

## Architecture

- Real data flow: **page/component → hook (`src/features/*/hooks`, TanStack Query)
  → service (`src/infrastructure/services/*`) → axios (`src/infrastructure/api/axios.ts`)**.
  Components never call services or axios directly — they go through hooks or context.
- Services **return `Result<T>`** (`{ success, data } | { success, errors, traceId }`)
  wrapped with `handleApiCall` (`src/infrastructure/api/apiHelper.ts`); they never throw.
  Any new service method must follow this pattern.
- `src/infrastructure/api/axios.ts` centralizes everything: injects the Bearer token, and
  the interceptor signs out on 401, shows a toast on 403, and throws `ApiException` on
  400/404/409 while normalizing the PascalCase/camelCase of the .NET Result pattern.
  Don't reimplement this in individual services.
- `src/proxy.ts` is the **Next 16 middleware** (formerly `middleware.ts`): `withAuth` +
  scope checks (`/projects` ⇒ `projects:read`, `/admin` ⇒ `labels:create`). The
  `config.matcher` protects `/admin`, `/projects`, `/backlog`, `/settings`. If you add a
  route that needs auth, add it to the matcher.
- `src/domain/` (pure entities and types) never imports from anywhere else; new interfaces
  go there, implementations go in `infrastructure/`.
- Alias `@/*` → `src/*` in `tsconfig.json` (Vitest resolves it via `resolve.tsconfigPaths`).
- **Every current page (`src/app/**/page.tsx`) is a client component**; server components
  are the exception and only make sense when no hooks/browser APIs are needed.

## Testing

- Vitest + jsdom + Testing Library. `src/test/setup.ts` **globally mocks
  `next-auth/react` and `next-auth`** (session = unauthenticated) — that's why tests don't
  need Keycloak or a backend.
- Tests are colocated in `__tests__/` next to the code they test (hooks and components in
  `src/features/...`; one service test in `src/test/infrastructure/services/`).
- Hook test pattern: `vi.mock('@/infrastructure/services/...')` + `vi.mock('react-hot-toast')`
  with `renderHook`/`act` imported from **`@testing-library/react`**
  (`@testing-library/react-hooks` is not installed).
- `@playwright/test` is in devDependencies but there is no config and no e2e tests yet.

## Instruction sources (`.opencode/`)

- **Rules** — detailed conventions that are NOT auto-loaded; read them before writing code:
  - `.opencode/rules/architecture.md` — layers, dependency rules, project structure, route/matcher rules
  - `.opencode/rules/conventions.md` — naming, import order, component patterns, error handling
  - `.opencode/rules/testing.md` — test commands, structure, patterns, anti-patterns
- **Skills** — auto-discovered by OpenCode; load with the `skill` tool when relevant:
  - `project-workflows` — feature/component/endpoint workflows, verification, branch lifecycle
  - `subagent-dispatch` — templates for delegating work to subagents
  - `ui-ux-pro-max` — design intelligence for UI/UX review and creation
- **Hook plugin** — `.opencode/plugins/verify-before-push/index.ts` (auto-loaded, typed via
  the `@opencode/plugin` devDependency): rewrites any `git push` issued by the shell tool
  into `npx tsc --noEmit && npx vitest run && git push ...`, so pushes only happen when
  typecheck and tests are green. Lint is excluded on purpose until its pre-existing
  baseline is fixed; edit the `VERIFY` constant in the plugin to change the chain.
