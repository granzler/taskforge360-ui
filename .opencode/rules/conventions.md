# Code Conventions — TaskForge360 UI

## General Principles

- **Functional components + hooks** — no class components
- **Single responsibility** — each component does one thing (~200 lines max)
- **DRY** — reusable logic lives in custom hooks or utilities
- **TypeScript strict mode** — avoid `any` at all costs
- **Client components in practice** — all current pages use `'use client'`; only add a server component when no hooks/browser APIs are needed

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `ProjectSelector.tsx` |
| Hooks | camelCase + `use` prefix | `useProject` |
| Interfaces/Types | PascalCase | `UserProject` |
| Files | camelCase (match folder neighbors) | `axios.ts`, `apiHelper.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Functions | camelCase | `getPriorityColor` |
| Feature directories | camelCase | `backlog/`, `projects/` |

## Import Order

Follow this order strictly, grouped and separated by blank lines:

```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// 2. Domain layer
import { User } from '@/domain/entities';
import { Priority, Status, Result } from '@/domain/types';

// 3. Infrastructure
import { projectService } from '@/infrastructure/services';

// 4. Features / local components
import { Button, Card, Badge } from '@/components/ui';
import { ProjectCard } from '@/features/projects/components';
```

## Component Patterns

### Client Components (the norm today)
```typescript
'use client';

import { useState } from 'react';
// ...
```

### Server Components (exception)
```typescript
// No 'use client'
export default async function ProjectsPage() {
  const projects = await getProjects(); // server action or direct fetch
  return <ProjectList projects={projects} />;
}
```

### Context API
```typescript
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be within ProjectProvider');
  return context;
}
```

## Formatting and Style

- **Tailwind CSS v4** — utility classes, CSS variables for theming, minimal custom CSS
- **ESLint** for linting — run `npm run lint` before committing (note: 8 pre-existing `no-explicit-any` errors in `src/app/api/auth/[...nextauth]/route.ts`; don't add new ones)
- **Type check** with `npx tsc --noEmit`
- **Tests** with `npx vitest run` (`npm run test` starts watch mode)

## Errors and Logging

- try/catch on every async operation (services use `handleApiCall` and return `Result<T>` instead of throwing)
- Descriptive error messages in English
- 401 handled globally in `src/infrastructure/api/axios.ts` (signs the user out)
- Use `error.tsx` for route-level error UI
