# AGENTS.md — TaskForge360 UI

## Project Overview

TaskForge360 es una aplicación Next.js 16 con React 19, TypeScript y Tailwind CSS 4. Sistema de gestión de tareas con autenticación next-auth.

---

## Quick Commands

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server en :3000 (usa `--no-deprecation` para suprimir DEP0205 de Turbopack) |
| `npm run build` | Build producción |
| `npm run start` | Servidor producción |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |
| `npm run test` | Vitest (35+ tests) |
| `npx vitest run` | Tests una vez (CI) |
| `npx vitest --ui` | Tests con Vitest UI |

---

## Clean Architecture

La arquitectura separa el código en capas con reglas de dependencia estrictas. Las capas internas **nunca** dependen de capas externas.

### Capas

| Capa | Responsabilidad |
|------|----------------|
| `domain/` | Entidades de negocio, interfaces, reglas |
| `application/` | Casos de uso, lógica de negocio |
| `infrastructure/` | Clientes API, servicios externos |
| `presentation/` | Componentes UI, páginas |

### Regla de Dependencia

```
presentation → application → domain
infrastructure implementa interfaces de domain
```

### Estructura del Proyecto

```
src/
├── app/                      # Next.js App Router (presentation)
│   ├── (routes)/             # Route groups
│   ├── api/                  # API routes
│   └── layout.tsx
├── components/               # Shared UI components
│   ├── ui/                   # Primitivas reutilizables (Button, Card, Badge, Input, EmptyState)
│   └── layout/               # Layout components (Navbar, Providers)
├── domain/                   # Core business entities
│   ├── entities/             # Interfaces TypeScript puras
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   └── Sprint.ts
│   └── types/                # Tipos compartidos (Priority, Status)
├── infrastructure/           # Implementaciones externas
│   ├── api/
│   │   └── axios.ts          # Axios client con interceptors
│   └── services/
│       ├── projectService.ts
│       └── sprintService.ts
├── features/                 # Módulos por feature (DDD-inspired)
│   └── [feature]/
│       ├── components/       # UI específica de la feature
│       ├── context/          # State management
│       ├── data/             # Mock data
│       └── api/              # API routes específicas
├── lib/                     # Utilities, helpers
│   └── utils/
│       └── colors.tsx
└── types/                   # Type definitions globales (next-auth)
```

---

## Code Style Guidelines

### Principios Generales
- Componentes funcionales con hooks exclusivamente
- Componentes pequeños (~200 líneas máx), responsabilidad única
- Lógica reutilizable → custom hooks o utilities
- TypeScript strict mode — evitar `any`

### Orden de Imports

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

### Convenciones de Nombres
- **Componentes**: PascalCase (`ProjectSelector.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useProject`)
- **Types/Interfaces**: PascalCase (`UserProject`)
- **Archivos**: kebab-case (`api.ts`)
- **Constantes**: SCREAMING_SNAKE_CASE

---

## React Patterns

### Server vs Client Components
- Default a **Server Components** (sin `'use client'`)
- Usar `'use client'` solo para: hooks, event handlers, APIs del browser
- Pasar estado del cliente via props desde server components

### Context API
- Crear context tipado con custom hook + error boundary
- Mantener context enfocado y pequeño

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

- try/catch para operaciones asíncronas
- Loggear errores con mensajes descriptivos
- Manejar 401 globalmente en interceptors de API (`src/infrastructure/api/axios.ts`)
- Usar `error.tsx` para manejo de errores a nivel de ruta

---

## Tailwind CSS v4

- Usar utility classes directamente
- Usar CSS variables para theming
- Mantener estilos custom al mínimo

---

## Common Tasks

### Crear una Nueva Feature
1. Crear carpeta en `src/features/[feature-name]/`
2. Subdirectorios: `components/`, `types/`, `context/`, `utils/`
3. Crear entidad domain si es necesario en `src/domain/entities/`
4. Agregar servicio infrastructure en `src/infrastructure/services/`
5. Crear página en `src/app/[feature]/page.tsx`

### Agregar un Nuevo UI Component
1. Crear componente en `src/components/ui/`
2. Exportar desde `src/components/ui/index.ts`
3. Usar variantes para diferentes estilos

### Agregar un Nuevo Endpoint API
1. Agregar entidad/interfaz en `src/domain/entities/`
2. Crear servicio en `src/infrastructure/services/`
3. Usar servicio en componentes/pages

---

## Skills Disponibles

| Skill | Descripción |
|-------|-------------|
| `ui-ux-pro-max` | Design intelligence: 67 estilos UI, 161 paletas, 57 pares tipográficos, 99 guías UX, accesibilidad, animación, responsive — ideal para revisar y mejorar la calidad visual del proyecto |

---

## TODOs

- **Eliminar `--no-deprecation` de `npm run dev`** cuando Next.js/Turbopack migre de `module.register()` a `module.registerHooks()` (Node.js 26 DEP0205)

---

## Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [UI/UX Pro Max](https://uupm.cc) — Design Intelligence Skill
