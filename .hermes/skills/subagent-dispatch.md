# Subagent Dispatch — TaskForge360 UI

## Cuándo Usar Subagentes

Usar `delegate_task` para tareas que:
- Requieren razonamiento profundo (debugging, code review)
- Inundarían el contexto con datos intermedios
- Son workstreams paralelos independientes

## Plantillas de Dispatch por Capa

### Dispatch para Feature UI (components + hooks)

```
Goal: Implementar el componente [X] con sus hooks
Context:
- El proyecto sigue Clean Architecture (ver .hermes/rules/architecture.md)
- Convenciones de código en .hermes/rules/conventions.md
- Feature: src/features/[feature-name]/
- Componentes UI base en src/components/ui/
- Entidad de dominio: src/domain/entities/[Entity].ts
- Servicio API: src/infrastructure/services/[service].ts
```

### Dispatch para Servicios (infrastructure)

```
Goal: Implementar/actualizar [service] en infrastructure
Context:
- Interfaz definida en src/domain/entities/[Entity].ts
- Cliente API base en src/infrastructure/api/axios.ts (maneja auth + 401)
- Convenciones en .hermes/rules/conventions.md
- Tests en src/features/[feature]/__tests__/
```

### Dispatch para Tests

```
Goal: Escribir tests para [component/hook/service]
Context:
- Testing standards en .hermes/rules/testing.md
- Archivo a testear: [path]
- Usar Vitest + @testing-library/react
- Convenciones en .hermes/rules/conventions.md
```

## Workflow de Subagentes

1. **Orquestador** analiza el problema y divide en tareas paralelas
2. **Cada subagente** trabaja en su capa con contexto aislado
3. **Orquestador** unifica resultados y verifica consistencia
4. **Si hay conflictos**, el orquestador los resuelve o pide intervención humana

## Consideraciones

- Subagentes NO tienen acceso a memoria del equipo — pasar contexto completo
- Subagentes NO pueden pedir aclaraciones — ser explícito en el goal
- Cada subagente tiene su propia terminal y directorio de trabajo
- Resultados son auto-reportados — verificar archivos creados/modificados
