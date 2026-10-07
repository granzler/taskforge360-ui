# Testing Standards — TaskForge360 UI

## Test Runner

The project uses **Vitest** with jsdom and Testing Library. There are 41 tests across 5 files covering components, hooks, and services.

## Commands

| Command | Description |
|---------|-------------|
| `npx vitest run` | Run tests once (use this to verify) |
| `npm run test` | Starts Vitest in **watch mode** |
| `npx vitest --ui` | Tests with Vitest UI (interactive dashboard) |
| `npx vitest run <path>` | Run a single test file |

## Test Structure

Tests live next to the code they test, in `__tests__/` directories:

```
src/features/backlog/hooks/__tests__/
├── useCreateWorkItem.test.ts
└── useUpdateWorkItem.test.ts

src/features/backlog/components/__tests__/
├── WorkItemForm.test.tsx
└── EpicsTab.test.tsx

src/test/infrastructure/services/
└── globalLabelService.test.ts
```

## Testing Patterns

### Global Setup
- `src/test/setup.ts` imports `@testing-library/jest-dom/vitest` and **globally mocks `next-auth/react` and `next-auth`** (session = unauthenticated) — tests never need Keycloak or a backend
- It also stubs `window.scrollTo`

### Hook Tests
- Use `renderHook` and `act` from **`@testing-library/react`** (`@testing-library/react-hooks` is NOT installed)
- Mock services with `vi.mock('@/infrastructure/services/...')` and mock `react-hot-toast`
- Assert initial state, loading, success, and error

### Component Tests
- Use `render`, `screen` from `@testing-library/react`
- Test conditional rendering, user events, empty states
- Mock context and hooks when necessary

### Service Tests
- Mock `axios` with `vi.mock('axios')` or `axios-mock-adapter`
- Test successful calls and error handling

## Rules

1. **Don't relax assertions** — if there is a loading state, assert it exists before success
2. **Every test must be independent** — use `beforeEach` to reset mocks (`vi.clearAllMocks()`)
3. **Name tests descriptively**: `'should return projects when API succeeds'`
4. **Cover edge cases**: empty arrays, network errors, 401 unauthorized
5. **Type-safe**: use `vi.mocked()` to type mocks

## Anti-Patterns

| Anti-Pattern | Alternative |
|-------------|-------------|
| Testing internal implementation | Test observable behavior (what the user sees) |
| Shared global mocks | `beforeEach` + `vi.clearAllMocks()` |
| Testing only the happy path | Always include an error case |
| `any` in mocks | `vi.mocked()` + concrete types |
