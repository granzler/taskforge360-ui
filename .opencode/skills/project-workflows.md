---
name: Project Workflows
description: TaskForge360 development workflow — how to create features, UI components, and API endpoints, the verification steps (lint, typecheck, tests), debugging process, and branch/PR lifecycle.
---

# Project Workflows — TaskForge360 UI

## Development Flow

### 1. Analysis and Planning
- Read `AGENTS.md` for project context
- Review `rules/architecture.md` for layer restrictions
- If the task is complex, write a plan first (e.g. `.opencode/plans/`)

### 2. Execution

#### Create a New Feature
1. `mkdir -p src/features/[name]/components/ src/features/[name]/hooks/ src/features/[name]/context/ src/features/[name]/data/`
2. Define the entity in `src/domain/entities/` if it doesn't exist
3. Create the service in `src/infrastructure/services/` (returning `Result<T>` via `handleApiCall`)
4. Implement hooks + context in `src/features/[name]/`
5. Create the page in `src/app/[name]/page.tsx`
6. If the route requires auth, add it to `config.matcher` in `src/proxy.ts`

#### Add a UI Component
1. Create it in `src/components/ui/[Component].tsx`
2. Export it from `src/components/ui/index.ts`
3. Use props/variants for different styles

#### Add an API Endpoint
1. Define the DTO/interface in `src/domain/entities/`
2. Add the method to the corresponding service (`src/infrastructure/services/`)
3. Use the service from hooks (never from components directly)

### 3. Testing
- **Always** write tests for new functionality
- Run `npx vitest run` before committing (note: `npm run test` starts watch mode)
- If tests fail, fix them before continuing
- Type check: `npx tsc --noEmit`
- Lint: `npm run lint` (8 pre-existing errors in the NextAuth route file are known)

### 4. Code Review

- Verify no dependency rules are broken (domain ← infrastructure ← features ← presentation)
- Verify import order
- Verify there is no new `any`
- Verify client/server component classification is correct

### 5. Debugging

When something doesn't work:

1. **Reproduce** — get the exact error and stack trace
2. **Isolate** — is it the component, hook, service, or API?
3. **Understand** — what should happen? What is happening?
4. **Fix** — one change at a time, test after each change
5. **Verify** — the fix doesn't break existing tests

### 6. Branch Lifecycle
- Create a branch from `main`: `git checkout -b feature/[description]`
- Atomic, descriptive commits
- Run lint + tests + type check before pushing
- Open a PR and request review

### Golden Rules

- **Client components are the norm today** — every page currently uses `'use client'`
- **Never import `infrastructure/` from components** — go through hooks or context
- **Test the happy path and the error path**
- **If the initial plan doesn't work, adjust — don't force it**
