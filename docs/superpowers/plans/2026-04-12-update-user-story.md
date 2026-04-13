# User Story Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar funcionalidad para actualizar historias de usuario existentes via modal de edición.

**Architecture:** Modal de edición basado en el patrón existente de CreateUserStoryModal. El usuario hace click en una historia, se abre el modal con los datos cargados, permite editar todos los campos, y guarda via userStoryService.update().

**Tech Stack:** React 19, TypeScript, Next.js 16, Tailwind CSS 4

---

## Context for Tasks

**Reference files (already reviewed):**
- `src/features/backlog/hooks/useCreateUserStory.ts` - patrón existente para hook
- `src/features/backlog/components/CreateUserStoryModal.tsx` - modal de creación (260 líneas)
- `src/infrastructure/services/userStoryService.ts:48-53` - servicio update ya existe
- `src/domain/entities/UserStory.ts` - DTOs: UpdateUserStoryRequestDto, UserStoryDto
- `src/features/backlog/components/UserStoryItem.tsx` - componente de item
- `src/features/backlog/components/SprintsTab.tsx` - usa UserStoryItem, línea 11, 184, 232

**Key observations:**
- El servicio `update` ya existe en `userStoryService.ts:48-53`
- No existe hook `useUpdateUserStory`
- No existe modal de edición
- No hay `onEdit` prop en UserStoryItem

---

## Task 1: Create useUpdateUserStory hook

**Files:**
- Create: `src/features/backlog/hooks/useUpdateUserStory.ts`
- Reference: `src/features/backlog/hooks/useCreateUserStory.ts`

- [ ] **Step 1: Write the failing test (skip - no test framework)**  
    N/A - el proyecto no tiene tests configurados según AGENTS.md

- [ ] **Step 2: Create useUpdateUserStory hook**

```typescript
// src/features/backlog/hooks/useUpdateUserStory.ts
'use client';

import { useState } from 'react';
import { UpdateUserStoryRequestDto, UserStoryDto } from '@/domain/entities/UserStory';
import { userStoryService } from '@/infrastructure/services/userStoryService';
import { toast } from 'react-hot-toast';

interface UseUpdateUserStoryOptions {
    onSuccess?: (story: UserStoryDto) => void;
    onError?: (error: string) => void;
}

export function useUpdateUserStory(options?: UseUpdateUserStoryOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = async (id: number, data: UpdateUserStoryRequestDto): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await userStoryService.update(id, data);
            if (result.success) {
                toast.success(`User story "${result.data.title}" updated!`);
                options?.onSuccess?.(result.data);
                return true;
            } else {
                const errorMsg = result.errors.map(e => e.message).join(', ') || 'Could not update user story.';
                setError(errorMsg);
                toast.error(errorMsg);
                options?.onError?.(errorMsg);
                return false;
            }
        } catch (err) {
            const errorMsg = 'Could not update user story. Please try again.';
            console.error('Failed to update user story (exception):', err);
            setError(errorMsg);
            toast.error(errorMsg);
            options?.onError?.(errorMsg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        update,
        isLoading,
        error,
    };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/backlog/hooks/useUpdateUserStory.ts
git commit -m "feat: add useUpdateUserStory hook"
```

---

## Task 2: Create extracted UserStoryForm component

**Files:**
- Create: `src/features/backlog/components/UserStoryForm.tsx`
- Reference: `src/features/backlog/components/CreateUserStoryModal.tsx` (lines 102-231)

- [ ] **Step 1: Create UserStoryForm.tsx**

Crear componente de formulario compartido que reciban tanto CreateUserStoryModal como EditUserStoryModal.

```typescript
// src/features/backlog/components/UserStoryForm.tsx
'use client';

import { useState } from 'react';
import { X, Loader2, FileText, AlignLeft, Hash, Flag, CheckSquare, FolderKanban } from 'lucide-react';
import { UserStoryStatus } from '@/domain/types';
import { Sprint } from '@/domain/entities/Sprint';
import { EpicResponseDto } from '@/domain/entities/Epic';

interface UserStoryFormProps {
    initialData?: {
        title: string;
        description?: string;
        storyPoints?: number;
        statusId: number;
        acceptanceCriteria?: string;
        sprintId?: number;
        epicId?: number;
    };
    projectId: number;
    projectName: string;
    sprints?: Sprint[];
    epics?: EpicResponseDto[];
    isSprintReadOnly?: boolean;
    isLoading: boolean;
    onSubmit: (data: {
        title: string;
        description?: string;
        storyPoints?: number;
        statusId: number;
        acceptanceCriteria?: string;
        sprintId?: number;
        epicId?: number;
        projectId: number;
        priority: number;
    }) => void;
    onCancel: () => void;
    submitLabel: string;
}

export default function UserStoryForm({
    initialData,
    projectId,
    projectName,
    sprints = [],
    epics = [],
    isSprintReadOnly = false,
    isLoading,
    onSubmit,
    onCancel,
    submitLabel,
}: UserStoryFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [storyPoints, setStoryPoints] = useState<number | ''>(initialData?.storyPoints || '');
    const [statusId, setStatusId] = useState<number>(initialData?.statusId || UserStoryStatus.Backlog);
    const [acceptanceCriteria, setAcceptanceCriteria] = useState(initialData?.acceptanceCriteria || '');
    const [selectedSprintId, setSelectedSprintId] = useState<number | undefined>(initialData?.sprintId);
    const [selectedEpicId, setSelectedEpicId] = useState<number | undefined>(initialData?.epicId);

    const isValid = title.trim().length > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            storyPoints: storyPoints || undefined,
            statusId,
            acceptanceCriteria: acceptanceCriteria.trim() || undefined,
            sprintId: selectedSprintId,
            epicId: selectedEpicId,
            projectId,
            priority: 2,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-1.5">
                <label htmlFor="story-title" className="block text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        id="story-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="As a user, I want to..."
                        autoFocus
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="story-description" className="block text-sm font-medium">
                    Description
                </label>
                <div className="relative">
                    <AlignLeft size={14} className="absolute left-3 top-3 text-muted-foreground" />
                    <textarea
                        id="story-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the user story in detail..."
                        rows={3}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground resize-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="story-points" className="block text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Hash size={13} /> Story Points</span>
                    </label>
                    <input
                        id="story-points"
                        type="number"
                        min="0"
                        max="100"
                        value={storyPoints}
                        onChange={(e) => setStoryPoints(e.target.value ? parseInt(e.target.value) : '')}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="story-status" className="block text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Flag size={13} /> Status</span>
                    </label>
                    <select
                        id="story-status"
                        value={statusId}
                        onChange={(e) => setStatusId(parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    >
                        <option value={UserStoryStatus.Backlog}>Backlog</option>
                        <option value={UserStoryStatus.ToDo}>To Do</option>
                        <option value={UserStoryStatus.InProgress}>In Progress</option>
                        <option value={UserStoryStatus.ReadyForReview}>Ready for Review</option>
                        <option value={UserStoryStatus.InReview}>In Review</option>
                        <option value={UserStoryStatus.Done}>Done</option>
                        <option value={UserStoryStatus.Blocked}>Blocked</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="story-sprint" className="block text-sm font-medium">
                        <span className="flex items-center gap-1.5"><FolderKanban size={13} /> Sprint</span>
                    </label>
                    {isSprintReadOnly ? (
                        <div className="px-3 py-2 text-sm rounded-md border border-border bg-muted/50 text-muted-foreground">
                            {sprints.find(s => s.id === selectedSprintId)?.name || `Sprint #${selectedSprintId}`}
                        </div>
                    ) : (
                        <select
                            id="story-sprint"
                            value={selectedSprintId || ''}
                            onChange={(e) => setSelectedSprintId(e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        >
                            <option value="">No Sprint (Backlog)</option>
                            {sprints.map(sprint => (
                                <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="story-epic" className="block text-sm font-medium">
                        <span className="flex items-center gap-1.5"><Flag size={13} /> Epic</span>
                    </label>
                    <select
                        id="story-epic"
                        value={selectedEpicId || ''}
                        onChange={(e) => setSelectedEpicId(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    >
                        <option value="">No Epic</option>
                        {epics.map(epic => (
                            <option key={epic.id} value={epic.id}>{epic.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="story-ac" className="block text-sm font-medium">
                    <span className="flex items-center gap-1.5"><CheckSquare size={13} /> Acceptance Criteria</span>
                </label>
                <textarea
                    id="story-ac"
                    value={acceptanceCriteria}
                    onChange={(e) => setAcceptanceCriteria(e.target.value)}
                    placeholder="Enter acceptance criteria (one per line)..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground resize-none"
                />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        submitLabel
                    )}
                </button>
            </div>
        </form>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/backlog/components/UserStoryForm.tsx
git commit -m "feat: extract UserStoryForm component for reuse"
```

---

## Task 3: Create EditUserStoryModal component

**Files:**
- Create: `src/features/backlog/components/EditUserStoryModal.tsx`

- [ ] **Step 1: Create EditUserStoryModal.tsx**

```typescript
// src/features/backlog/components/EditUserStoryModal.tsx
'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useUpdateUserStory } from '../hooks/useUpdateUserStory';
import { UserStoryDto } from '@/domain/entities/UserStory';
import { UpdateUserStoryRequestDto } from '@/domain/entities/UserStory';
import { Sprint } from '@/domain/entities/Sprint';
import { EpicResponseDto } from '@/domain/entities/Epic';
import UserStoryForm from './UserStoryForm';

interface EditUserStoryModalProps {
    story: UserStoryDto;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: (story: UserStoryDto) => void;
    sprints?: Sprint[];
    epics?: EpicResponseDto[];
}

export default function EditUserStoryModal({
    story,
    isOpen,
    onClose,
    onUpdated,
    sprints = [],
    epics = [],
}: EditUserStoryModalProps) {
    const { update, isLoading } = useUpdateUserStory({
        onSuccess: (updatedStory) => {
            onUpdated(updatedStory);
            onClose();
        },
    });

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (data: {
        title: string;
        description?: string;
        storyPoints?: number;
        statusId: number;
        acceptanceCriteria?: string;
        sprintId?: number;
        epicId?: number;
        projectId: number;
        priority: number;
    }) => {
        const dto: UpdateUserStoryRequestDto = {
            title: data.title,
            description: data.description,
            storyPoints: data.storyPoints,
            statusId: data.statusId,
            acceptanceCriteria: data.acceptanceCriteria,
            sprintId: data.sprintId,
            epicId: data.epicId,
            projectId: data.projectId,
            priority: data.priority,
        };

        await update(story.id, dto);
    };

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="pointer-events-auto w-full max-w-lg bg-background rounded-xl shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <div>
                            <h2 className="text-base font-bold">Edit User Story</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{story.title}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="px-6 py-5">
                        <UserStoryForm
                            initialData={{
                                title: story.title,
                                description: story.description,
                                storyPoints: story.storyPoints,
                                statusId: story.statusId,
                                acceptanceCriteria: story.acceptanceCriteria,
                                sprintId: story.sprintId,
                                epicId: story.epicId,
                            }}
                            projectId={story.projectId}
                            projectName=""
                            sprints={sprints}
                            epics={epics}
                            isSprintReadOnly={!!story.sprintId}
                            isLoading={isLoading}
                            onSubmit={handleSubmit}
                            onCancel={onClose}
                            submitLabel="Save Changes"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/backlog/components/EditUserStoryModal.tsx
git commit -m "feat: add EditUserStoryModal component"
```

---

## Task 4: Refactor CreateUserStoryModal to use UserStoryForm

**Files:**
- Modify: `src/features/backlog/components/CreateUserStoryModal.tsx`

- [ ] **Step 1: Refactor CreateUserStoryModal.tsx to use UserStoryForm**

Reemplazar el formulario inline con el componente UserStoryForm extraído.

```typescript
// src/features/backlog/components/CreateUserStoryModal.tsx
'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useCreateUserStory } from '../hooks/useCreateUserStory';
import { CreateUserStoryRequestDto } from '@/domain/entities/UserStory';
import { Sprint } from '@/domain/entities/Sprint';
import { EpicResponseDto } from '@/domain/entities/Epic';
import UserStoryForm from './UserStoryForm';

interface CreateUserStoryModalProps {
    projectId: number;
    projectName: string;
    sprints?: Sprint[];
    epics?: EpicResponseDto[];
    sprintId?: number;
    epicId?: number;
    onClose: () => void;
    onCreated: (storyId?: number) => void;
}

export default function CreateUserStoryModal({
    projectId,
    projectName,
    sprints = [],
    epics = [],
    sprintId,
    epicId,
    onClose,
    onCreated,
}: CreateUserStoryModalProps) {
    const { create, isLoading } = useCreateUserStory({
        onSuccess: (story) => {
            onCreated(story.id);
        },
    });

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleSubmit = async (data: {
        title: string;
        description?: string;
        storyPoints?: number;
        statusId: number;
        acceptanceCriteria?: string;
        sprintId?: number;
        epicId?: number;
        projectId: number;
        priority: number;
    }) => {
        const dto: CreateUserStoryRequestDto = {
            title: data.title,
            description: data.description,
            storyPoints: data.storyPoints,
            statusId: data.statusId,
            acceptanceCriteria: data.acceptanceCriteria,
            sprintId: data.sprintId,
            epicId: data.epicId,
            projectId: data.projectId,
            priority: data.priority,
        };

        await create(dto);
    };

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="pointer-events-auto w-full max-w-lg bg-background rounded-xl shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <div>
                            <h2 className="text-base font-bold">Create User Story</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{projectName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="px-6 py-5">
                        <UserStoryForm
                            initialData={{
                                title: '',
                                description: undefined,
                                storyPoints: undefined,
                                statusId: 1, // Backlog
                                acceptanceCriteria: undefined,
                                sprintId: sprintId,
                                epicId: epicId,
                            }}
                            projectId={projectId}
                            projectName={projectName}
                            sprints={sprints}
                            epics={epics}
                            isSprintReadOnly={!!sprintId}
                            isLoading={isLoading}
                            onSubmit={handleSubmit}
                            onCancel={onClose}
                            submitLabel="Create Story"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/backlog/components/CreateUserStoryModal.tsx
git commit -m "refactor: use UserStoryForm in CreateUserStoryModal"
```

---

## Task 5: Modify UserStoryItem to handle edit action

**Files:**
- Modify: `src/features/backlog/components/UserStoryItem.tsx`

- [ ] **Step 1: Add onEdit prop and edit button**

Agregar prop `onEdit?: (story: UserStoryDto) => void` y botón de edición visible cuando está expandido o siempre-visible.

```typescript
// Modificar interface y componente para incluir onEdit

// En UserStoryItemProps (línea ~10):
interface UserStoryItemProps {
    story: UserStoryDto;
    isExpanded: boolean;
    onToggle: (id: number) => void;
    onEdit?: (story: UserStoryDto) => void;  // AGREGAR
    subtasks: SubTask[];
    epic?: Epic | EpicResponseDto;
}

// Modificar el componente para aceptar y usar onEdit
// Agregar botón de editar visible cuando está expandido
// Ubicación: después del botón "Add Subtask" (línea ~69)

// Agregar botón de editar:
{isExpanded && onEdit && (
    <button
        onClick={(e) => {
            e.stopPropagation();
            onEdit(story);
        }}
        className="flex items-center gap-1.5 text-[10px] font-medium text-primary hover:underline mt-1 pl-1"
    >
        <Pencil size={10} /> Edit Story
    </button>
)}
```

Necesitarás agregar `Pencil` a los imports de lucide-react.

- [ ] **Step 2: Commit**

```bash
git add src/features/backlog/components/UserStoryItem.tsx
git commit -m "feat: add onEdit handler to UserStoryItem"
```

---

## Task 6: Wire up edit flow in parent components

**Files:**
- Modify: `src/features/backlog/components/SprintsTab.tsx` (usa UserStoryItem)

- [ ] **Step 1: Add EditUserStoryModal and wire up onEdit in SprintsTab.tsx**

1. Importar EditUserStoryModal
2. Agregar estado para historia en edición: `const [editingStory, setEditingStory] = useState<UserStoryDto | null>(null);`
3. Agregar prop `onEdit={(story) => setEditingStory(story)}` a cada UserStoryItem
4. Agregar el modal al render: `{editingStory && <EditUserStoryModal ... />}`

El código específico depende de cómo esté estructurado SprintsTab.tsx. Revisar líneas 184 y 232 donde está UserStoryItem.

**Para el onUpdated callback:** hacer refresh de los datos del backlog después de editar.

```typescript
// En SprintsTab.tsx
import { useState } from 'react';
import EditUserStoryModal from './EditUserStoryModal';
import { UserStoryDto } from '@/domain/entities/UserStory';

// En el componente:
const [editingStory, setEditingStory] = useState<UserStoryDto | null>(null);
const [refreshKey, setRefreshKey] = useState(0);

// En la prop onEdit de cada UserStoryItem:
onEdit={(story) => setEditingStory(story)}

// Para el modal:
{editingStory && (
    <EditUserStoryModal
        story={editingStory}
        isOpen={!!editingStory}
        onClose={() => {
            setEditingStory(null);
            setRefreshKey(k => k + 1); // trigger refresh
        }}
        onUpdated={(story) => {
            // Optionally update local state
            setRefreshKey(k => k + 1);
        }}
        sprints={sprints}
        epics={epics}
    />
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/backlog/components/SprintsTab.tsx
git commit -m "feat: wire up edit flow in SprintsTab"
```

---

## Verification

After all tasks complete, verify:

- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] No console errors on page load

Run:
```bash
npm run lint && npx tsc --noEmit
```