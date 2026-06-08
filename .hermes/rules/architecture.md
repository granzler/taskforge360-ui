# Architecture Rules — TaskForge360 UI

## Clean Architecture Overview

El proyecto sigue Clean Architecture con 4 capas. Las capas internas (domain) **nunca** importan de capas externas (infrastructure, presentation).

### Regla de Dependencia Estricta

```
presentation (app/, components/) → application → domain (entities, types)
infrastructure (api/, services/) implementa interfaces de domain
```

### Data Flow

```
Pages/Components → Custom Hooks → Services → API Client → Backend
                                  ↓
                          Domain Entities (tipos puros)
```

- Los **servicios** en `infrastructure/` implementan llamadas API y devuelven entidades de dominio
- Los **hooks** en `features/` gestionan estado y llaman a servicios
- Los **componentes** solo reciben props y renderizan — nunca llaman a servicios directamente
- El **API Client** (`src/infrastructure/api/axios.ts`) maneja autenticación y errores 401 globalmente

### Diagrama de Capas

```
┌─────────────────────────────────────────┐
│            presentation                  │
│  (app/, components/, features/*/)       │
├─────────────────────────────────────────┤
│            application                   │
│  (useCases, custom hooks, context)       │
├──────────────────┬──────────────────────┤
│    domain        │   infrastructure      │
│  (entities,      │  (api/, services/)    │
│   types)         │                      │
└──────────────────┴──────────────────────┘
```

## Project Structure

```
src/
├── app/                  # Next.js App Router — páginas y API routes
├── components/           # Componentes compartidos
│   ├── ui/              # Primitivas (Button, Card, Badge, Input, EmptyState, Skeleton)
│   └── layout/          # Navbar, Providers
├── domain/              # Entidades de negocio puras (sin dependencias externas)
│   ├── entities/        # User, Project, Sprint, etc.
│   └── types/           # Priority, Status, etc.
├── infrastructure/      # Implementaciones concretas de interfaces de domain
│   ├── api/             # Axios client con interceptors
│   └── services/        # projectService, sprintService, subtaskService
├── features/            # Módulos por feature
│   ├── projects/
│   ├── backlog/
│   ├── auth/
│   └── labels/
├── lib/                 # Utilities
└── types/               # Type definitions (next-auth)
```

## Reglas Clave

1. **Nada en `domain/` importa de `infrastructure/` o `presentation/`**
2. **Las interfaces se definen en `domain/`**, las implementaciones van en `infrastructure/`
3. **Los componentes no importan de `infrastructure/` directamente** — usan hooks o context
4. **Cada feature module** puede tener sus propios componentes, context, data (mock) y API routes
5. **Server Components por defecto** — solo usar `'use client'` cuando sea necesario
