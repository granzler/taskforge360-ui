# Testing Standards — TaskForge360 UI

## Test Runner

El proyecto usa **Vitest** como test runner. Hay 35+ tests cubriendo componentes, hooks y servicios.

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run test` | Ejecutar tests |
| `npx vitest run` | Tests una vez (modo CI) |
| `npx vitest --ui` | Tests con Vitest UI (dashboard interactivo) |

## Estructura de Tests

Los tests se colocan junto al código que prueban, en directorios `__tests__/`:

```
src/features/backlog/hooks/__tests__/
├── useUpdateUserStory.test.ts
└── useCreateUserStory.test.ts

src/features/backlog/components/__tests__/
└── EpicsTab.test.tsx
```

## Patrones de Testing

### Tests de Hooks
- Usar `renderHook` de `@testing-library/react-hooks`
- Mockear servicios con `vi.mock()`
- Probar estado inicial, loading, éxito y error

### Tests de Componentes
- Usar `render`, `screen` de `@testing-library/react`
- Probar renderizado condicional, eventos de usuario, estados vacíos
- Mockear contexto y hooks cuando sea necesario

### Tests de Servicios
- Mockear `axios` con `vi.mock('axios')`
- Probar llamadas exitosas y manejo de errores
- Verificar que los interceptores (401) funcionan

## Reglas

1. **No relajar assertions** — si hay un estado de carga, probar que existe antes del éxito
2. **Cada test debe ser independiente** — usar `beforeEach` para limpiar mocks
3. **Nombrar tests descriptivamente**: `'should return projects when API succeeds'`
4. **Cubrir casos límite**: arrays vacíos, errores de red, 401 no autorizado
5. **Type-safe**: usar `vi.mocked()` para typar mocks

## Anti-Patterns

| Anti-Pattern | Alternativa |
|-------------|-------------|
| Testear implementación interna | Testear comportamiento observable (lo que ve el usuario) |
| Mocks globales compartidos | `beforeEach` + `vi.resetAllMocks()` |
| Testear solo el camino feliz | Siempre incluir caso de error |
| `any` en mocks | Usar `vi.mocked()` + tipos concretos |
