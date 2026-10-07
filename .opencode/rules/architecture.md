# Architecture Rules — TaskForge360 UI

## Clean Architecture Overview

The project follows Clean Architecture with strict dependency rules. Inner layers (domain) **never** import from outer layers (infrastructure, presentation).

### Strict Dependency Rule

```
app/ + components/ (presentation) → features/ (application logic) → domain/ (entities, types)
infrastructure/ (api/, services/) implements the interfaces defined in domain/
Nothing in domain/ imports from anywhere else
```

### Data Flow

```
Pages/Components → Custom Hooks → Services → API Client → Backend
                        ↓
                Domain Entities (pure types)
```

- **Services** in `infrastructure/` perform API calls and return `Result<T>` (wrapped by `handleApiCall`)
- **Hooks** in `features/` manage state (TanStack Query) and call services
- **Components** only receive props and render — they never call services directly
- The **API client** (`src/infrastructure/api/axios.ts`) handles authentication and 401/403/400 errors globally

### Layer Diagram

```
┌─────────────────────────────────────────┐
│            presentation                  │
│  (app/, components/)                    │
├─────────────────────────────────────────┤
│        features (application)           │
│  (hooks, context, components)           │
├──────────────────┬──────────────────────┤
│    domain        │   infrastructure      │
│  (entities,      │  (api/, services/)    │
│   types)         │                      │
└──────────────────┴──────────────────────┘
```

## Project Structure

```
src/
├── app/                  # Next.js App Router — pages and API routes (all pages are 'use client')
├── components/           # Shared components
│   ├── ui/               # Primitives (Button, Card, Badge, Input, EmptyState, Skeleton, ConfirmModal)
│   └── layout/           # Navbar, Providers
├── domain/               # Pure business entities (no external dependencies)
│   ├── entities/         # User, Project, Sprint, WorkItem, Epic, GlobalLabel
│   └── types/            # Priority, Status, Result, ApiError, etc.
├── infrastructure/       # Concrete implementations of domain interfaces
│   ├── api/              # Axios client with interceptors, apiHelper, exceptions
│   └── services/         # projectService, sprintService, workItemService, epicService, globalLabelService
├── features/             # Feature modules
│   ├── projects/
│   ├── backlog/
│   ├── auth/
│   └── labels/
├── lib/                  # Utilities
├── proxy.ts              # Next 16 middleware (auth + scope checks)
└── types/                # Type definitions (next-auth session)
```

## Key Rules

1. **Nothing in `domain/` imports from `infrastructure/` or the presentation layers**
2. **Interfaces are defined in `domain/`**, implementations live in `infrastructure/`
3. **Components do not import from `infrastructure/` directly** — they use hooks or context
4. **Each feature module** can have its own components, hooks, context, and mock data
5. **Client components in practice** — every current page uses `'use client'`; add server components only when no hooks/browser APIs are needed
6. **New routes that require auth** must be added to `config.matcher` in `src/proxy.ts`
