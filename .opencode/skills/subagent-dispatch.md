---
name: Subagent Dispatch
description: Templates and workflow for delegating TaskForge360 work to subagents — per-layer dispatch prompts (feature UI, services, tests) and context requirements for isolated workers.
---

# Subagent Dispatch — TaskForge360 UI

## When to Use Subagents

Use `delegate_task` for tasks that:
- Require deep reasoning (debugging, code review)
- Would flood the context with intermediate data
- Are independent parallel workstreams

## Dispatch Templates per Layer

### Dispatch for Feature UI (components + hooks)

```
Goal: Implement component [X] with its hooks
Context:
- The project follows Clean Architecture (see .opencode/rules/architecture.md)
- Code conventions in .opencode/rules/conventions.md
- Feature: src/features/[feature-name]/
- Base UI components in src/components/ui/
- Domain entity: src/domain/entities/[Entity].ts
- API service: src/infrastructure/services/[service].ts
```

### Dispatch for Services (infrastructure)

```
Goal: Implement/update [service] in infrastructure
Context:
- Interface defined in src/domain/entities/[Entity].ts
- Base API client in src/infrastructure/api/axios.ts (handles auth + 401)
- Services must return Result<T> via handleApiCall (src/infrastructure/api/apiHelper.ts)
- Conventions in .opencode/rules/conventions.md
- Tests in src/features/[feature]/__tests__/ or src/test/
```

### Dispatch for Tests

```
Goal: Write tests for [component/hook/service]
Context:
- Testing standards in .opencode/rules/testing.md
- File to test: [path]
- Use Vitest + @testing-library/react (renderHook comes from there)
- Conventions in .opencode/rules/conventions.md
```

## Subagent Workflow

1. **Orchestrator** analyzes the problem and splits it into parallel tasks
2. **Each subagent** works on its layer with isolated context
3. **Orchestrator** merges results and verifies consistency
4. **If there are conflicts**, the orchestrator resolves them or asks for human input

## Considerations

- Subagents have NO access to team memory — pass complete context
- Subagents CANNOT ask clarifying questions — be explicit in the goal
- Each subagent has its own terminal and working directory
- Results are self-reported — verify the files that were created/modified
