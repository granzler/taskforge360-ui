# AGENTS.md - TaskForge360 UI Development Guide

## Project Overview
TaskForge360 is a Next.js 16 application with React 19, TypeScript, and Tailwind CSS 4. Task management system with next-auth authentication.

## Build/Lint/Test Commands

```bash
npm run dev           # Start Next.js dev server on port 3000
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
npx tsc --noEmit      # TypeScript type check
# No tests configured yet. Use Vitest + React Testing Library if adding tests.
```

---

## Clean Architecture Principles

Clean Architecture separates code into layers with strict dependency rules: **domain** (entities), **application** (use cases), **infrastructure** (external services), **presentation** (UI). Inner layers never depend on outer layers.

### Layer Responsibilities

| Layer | Responsibility |
|-------|---------------|
| `domain/` | Business entities, interfaces, rules |
| `application/` | Use cases, business logic |
| `infrastructure/` | API clients, external services |
| `presentation/` | UI components, pages |

### Dependency Rule
```
presentation → application → domain
infrastructure implements domain interfaces
```

---

## Project Structure (Feature-Based Clean Architecture)

```
src/
├── app/                      # Next.js App Router (presentation)
│   ├── (routes)/             # Route groups
│   ├── api/                  # API routes
│   └── layout.tsx
├── components/               # Shared UI components
│   ├── ui/                   # Reusable primitives (Button, Card, Badge, Input, EmptyState)
│   └── layout/               # Layout components (Navbar, Providers)
├── domain/                   # Core business entities
│   ├── entities/             # Pure TypeScript interfaces
│   │   ├── User.ts           # User, UserSearchResult
│   │   ├── Project.ts        # Project, Epic, UserStory, SubTask, etc.
│   │   └── Sprint.ts         # Sprint, SprintStatus
│   └── types/                # Shared types (Priority, Status)
├── infrastructure/           # External implementations
│   ├── api/
│   │   └── axios.ts         # Axios client with interceptors
│   └── services/
│       ├── projectService.ts
│       └── sprintService.ts
├── features/                 # Feature modules (DDD-inspired)
│   └── [feature]/
│       ├── components/       # Feature-specific UI
│       ├── context/          # Feature state management
│       ├── data/             # Mock data
│       └── api/              # Feature-specific API routes
├── lib/                     # Utilities, helpers
│   └── utils/
│       └── colors.tsx        # getPriorityColor, getStatusIcon
└── types/                   # Global type definitions (next-auth)
```

---

## Code Style Guidelines

### General Principles
- Use functional components with hooks exclusively
- Keep components small (single responsibility, ~200 lines max)
- Extract reusable logic into custom hooks or utilities
- TypeScript strict mode - avoid `any`

### Imports Order
```typescript
// 1. External libs
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
// 2. Domain layer
import { User } from '@/domain/entities';
import { Priority, Status } from '@/domain/types';
// 3. Application layer
import { createProject } from '@/application/useCases';
// 4. Infrastructure
import { projectService } from '@/infrastructure/services';
// 5. Local features / components
import { Button, Card, Badge } from '@/components/ui';
import { ProjectCard } from '@/features/projects/components';
```

### Naming Conventions
- **Components**: PascalCase (`ProjectSelector.tsx`)
- **Hooks**: camelCase with `use` prefix (`useProject`)
- **Types/Interfaces**: PascalCase (`UserProject`)
- **Files**: kebab-case (`api.ts`)
- **Constants**: SCREAMING_SNAKE_CASE

---

## React Patterns

### Server vs Client Components
- Default to **Server Components** (no `'use client'`)
- Use `'use client'` only for: hooks, event handlers, browser APIs
- Pass client state via props from server components

### Context Usage
- Create typed context with custom hook + error boundary
- Keep context focused and small

```typescript
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be within ProjectProvider');
  return context;
}
```

---

## Error Handling

- Use try/catch for async operations
- Log errors with descriptive messages
- Handle 401 globally in API interceptors (see `src/infrastructure/api/axios.ts`)
- Use `error.tsx` for route-level error handling

---

## Tailwind CSS (v4)
- Use utility classes directly
- Use CSS variables for theming
- Keep custom styles minimal

---

## Common Tasks

### Creating a New Feature
1. Create folder under `src/features/[feature-name]/`
2. Add subdirectories: `components/`, `types/`, `context/`, `utils/`
3. Create domain entity if needed in `src/domain/entities/`
4. Add infrastructure service in `src/infrastructure/services/`
5. Create page in `src/app/[feature]/page.tsx`

### Adding a New UI Component
1. Create component in `src/components/ui/`
2. Export from `src/components/ui/index.ts`
3. Use variants for different styles

### Adding a New API Endpoint
1. Add domain entity/interface in `src/domain/entities/`
2. Create service in `src/infrastructure/services/`
3. Use service in components/pages

---

## Resources
- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com/docs)
- [NextAuth.js](https://next-auth.js.org/)
