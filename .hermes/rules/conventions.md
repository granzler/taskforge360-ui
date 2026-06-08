# Code Conventions — TaskForge360 UI

## Principios Generales

- **Functional Components + Hooks** — sin class components
- **Single Responsibility** — cada componente hace una cosa (~200 líneas máx)
- **DRY** — lógica reusable en custom hooks o utilities
- **TypeScript strict mode** — evitar `any` a toda costa
- **Server-first** — server components por defecto, `'use client'` solo cuando se necesitan hooks/eventos/browser APIs

## Naming Conventions

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Componentes | PascalCase | `ProjectSelector.tsx` |
| Hooks | camelCase + `use` prefix | `useProject` |
| Interfaces/Types | PascalCase | `UserProject` |
| Archivos | kebab-case | `api.ts`, `user-service.ts` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Funciones | camelCase | `getPriorityColor` |
| Directorios de features | kebab-case | `project-settings/` |

## Orden de Imports

Seguir este orden estricto, agrupado y separado por líneas en blanco:

```typescript
// 1. Librerías externas
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// 2. Capa domain
import { User } from '@/domain/entities';
import { Priority, Status } from '@/domain/types';

// 3. Capa application
import { createProject } from '@/application/useCases';

// 4. Infrastructure
import { projectService } from '@/infrastructure/services';

// 5. Features / componentes locales
import { Button, Card, Badge } from '@/components/ui';
import { ProjectCard } from '@/features/projects/components';
```

## Patrones de Componentes

### Server Components (default)
```typescript
// NO usar 'use client'
import { ProjectList } from '@/features/projects/components';

export default async function ProjectsPage() {
  const projects = await getProjects(); // server action o fetch directo
  return <ProjectList projects={projects} />;
}
```

### Client Components (solo cuando es necesario)
```typescript
'use client';

import { useState } from 'react';
// ...
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

## Formato y Estilo

- **Tailwind CSS v4** — utility classes, CSS variables para theming, mínimo CSS custom
- **Prettier** para formato consistente (si está configurado)
- **ESLint** para linting — correr `npm run lint` antes de commitear
- **Type check** con `npx tsc --noEmit`

## Errores y Logging

- try/catch en toda operación asíncrona
- Mensajes de error descriptivos en español o inglés (consistente con el equipo)
- Errores 401 manejados globalmente en `src/infrastructure/api/axios.ts`
- Usar `error.tsx` para UI de errores por ruta
