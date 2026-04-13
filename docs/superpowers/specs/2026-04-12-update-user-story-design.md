# Update User Story - Design Spec

## Overview

Implementar funcionalidad para actualizar historias de usuario existentes en el backlog. El usuario hace click en una historia y se abre un modal de edición con todos los campos editables.

## Architecture

```
UserStoryItem (click)
       │
       ▼
UserStoryItem expanded ──(click to edit)──▶ EditUserStoryModal
                                                 │
                                                 ▼
                                          useUpdateUserStory hook
                                                 │
                                                 ▼
                                          userStoryService.update()
```

## Components to Create

### 1. Hook: `useUpdateUserStory.ts`

Ubicación: `src/features/backlog/hooks/useUpdateUserStory.ts`

```typescript
interface UseUpdateUserStoryOptions {
    onSuccess?: (story: UserStoryDto) => void;
    onError?: (error: string) => void;
}

export function useUpdateUserStory(options?: UseUpdateUserStoryOptions) {
    // Estados: isLoading, error
    // Método: update(id: number, data: UpdateUserStoryRequestDto): Promise<boolean>
    // Manejo de errores con toast notifications
}
```

### 2. Modal: `EditUserStoryModal.tsx`

Ubicación: `src/features/backlog/components/EditUserStoryModal.tsx`

- Props: `story: UserStoryDto`, `isOpen`, `onClose`, `onSuccess`
- formulario con todos los campos de `UserStoryDto`
- Carga datos existentes al abrir
- Llama a `useUpdateUserStory` en submit
-Manejo de estados: loading, error

### 3. Reusable Form: `UserStoryForm.tsx`

Ubicación: `src/features/backlog/components/UserStoryForm.tsx`

- Componente de formulario compartido entre Create y Edit
- Props: `initialData?`, `onSubmit`, `isLoading`, `submitLabel`
- Incluye todos los campos editables

### 4. Modifications to: `UserStoryItem.tsx`

- Agregar prop `onEdit?: (story: UserStoryDto) => void`
- Agregar botón de editar visible en estado expandido o al hacer click en el item

## UI/UX

### Modal Layout

```
┌─────────────────────────────────────────────┐
│  Edit User Story                    ✕     │
├─────────────────────────────────────────────┤
│  Title:        [___________________]       │
│  Description: [___________________]       │
│  Epic:        [Select v]                │
│  Sprint:      [Select v]                │
│  Status:      [Select v]                │
│  Priority:   [Select v]                │
│  Story Points:[_____]                   │
│  Acceptance Criteria:                   │
│  [_______________________________]        │
├─────────────────────────────────────────────┤
│           [Cancel]    [Save Changes]      │
└─────────────────────────────────────────────┘
```

### Interaction Flow

1. Usuario hace click en UserStoryItem
2. Se expande mostrando subtasks
3. Usuario hace click en botón "Edit" o double-click en el item
4. Se abre EditUserStoryModal con datos cargados
5. Usuario modifica campos
6. Click en "Save Changes"
7. Llama API, muestra loading state
8. On success: cierra modal, muestra toast, refresh de lista
9. On error: muestra error en toast

## Data Flow

```typescript
// UserStoryItem.tsx
<ParentComponent> ──onEdit(story)──► EditUserStoryModal (isOpen=true)

                        │
                        ▼
                 useUpdateUserStory.update(id, data)
                        │
                        ▼
                 userStoryService.update(id, updateData)
                        │
                        ▼
                 API: PUT /api/UserStories/{id}
```

## File Changes

| File | Action |
|------|--------|
| `src/features/backlog/hooks/useCreateUserStory.ts` | Read for reference |
| `src/features/backlog/components/CreateUserStoryModal.tsx` | Read for reference |
| `src/features/backlog/hooks/useUpdateUserStory.ts` | **Create** |
| `src/features/backlog/components/UserStoryForm.tsx` | **Create** (extract form) |
| `src/features/backlog/components/EditUserStoryModal.tsx` | **Create** |
| `src/features/backlog/components/CreateUserStoryModal.tsx` | **Refactor** to use UserStoryForm |
| `src/features/backlog/components/UserStoryItem.tsx` | **Modify** add onEdit handler |
| `src/features/backlog/components/BacklogView.tsx` | **Modify** wire up onEdit |

## Testing

- [ ] Hook: loading state, success, error handling
- [ ] Modal: opens with correct data, submits, closes
- [ ] Form: validation, all fields editable
- [ ] Integration: full flow from click to API call