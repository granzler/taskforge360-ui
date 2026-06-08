# Project Workflows — TaskForge360 UI

## Flujo de Desarrollo

### 1. Análisis y Planificación
- Leer `AGENTS.md` para entender el contexto del proyecto
- Revisar `rules/architecture.md` para restricciones de capas
- Si la tarea es compleja, crear un plan en `.hermes/plans/`

### 2. Ejecución

#### Crear una Nueva Feature
1. `mkdir -p src/features/[nombre]/components/ src/features/[nombre]/types/ src/features/[nombre]/context/ src/features/[nombre]/utils/`
2. Definir entidad en `src/domain/entities/` si no existe
3. Crear servicio en `src/infrastructure/services/`
4. Implementar hooks + context en `src/features/[nombre]/`
5. Crear página en `src/app/[nombre]/page.tsx`

#### Agregar UI Component
1. Crear en `src/components/ui/[Component].tsx`
2. Exportar desde `src/components/ui/index.ts`
3. Usar variantes (via props) para distintos estilos

#### Agregar Endpoint API
1. Definir DTO/interface en `src/domain/entities/`
2. Crear método en servicio correspondiente (`src/infrastructure/services/`)
3. Usar el servicio desde hooks o server components

### 3. Testing
- **Siempre** escribir tests para nueva funcionalidad
- Correr `npm run test` antes de commitear
- Si hay tests fallando, corregir antes de continuar
- Type check: `npx tsc --noEmit`

### 4. Code Review
- Verificar que no se rompen reglas de dependencia (domain ← infrastructure ← presentation)
- Verificar orden de imports
- Verificar que no hay `any`
- Verificar que server/client component está correctamente clasificado

### 5. Debugging

Cuando algo no funciona:

1. **Reproducir** — obtener el error exacto y stack trace
2. **Aislar** — identificar si es problema de componente, hook, servicio o API
3. **Entender** — ¿qué debería pasar? ¿qué está pasando?
4. **Corregir** — un cambio a la vez, testear después de cada cambio
5. **Verificar** — el fix no rompe tests existentes

### 6. Branch Lifecycle
- Crear branch desde `main`: `git checkout -b feature/[descripcion]`
- Commits atómicos y descriptivos
- Correr lint + tests + type check antes de push
- Crear PR y solicitar review

### Reglas de Oro

- **Server components por defecto** — `'use client'` es la excepción
- **No importar infrastructure desde components** — usar hooks o context
- **Probar el camino feliz y el camino de error**
- **Si el plan inicial no funciona, ajustar — no forzar**
