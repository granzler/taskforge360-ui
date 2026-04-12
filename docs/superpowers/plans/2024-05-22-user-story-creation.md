# User Story Creation Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a centralized `CreateUserStoryModal` component that allows users to create new user stories within a project, either assigned to a specific sprint or in the backlog.

**Architecture:** Follows Clean Architecture principles:
- **Presentation Layer**: React components (`CreateUserStoryModal`) using existing UI primitives.
- **Application Layer**: Custom hook (`useCreateUserStory`) for managing form state and API interaction.
- **Infrastructure Layer**: Integration with `userStoryService` to communicate with the backend.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, `react-hot-toast`, `lucide-react`.

---

### Task 1: Define Domain/Types (if needed) and Service Integration

**Files:**
- Modify: `src/infrastructure/services/userStoryService.ts` (ensure `create` method exists with correct signature)
- Test: `tests/infrastructure/services/userStoryService.test.ts`

- [ ] **Step 1: Verify or implement `create` method in `userStoryService.ts`**

```typescript
// src/infrastructure/services/userStoryService.ts

export const userStoryService = {
  // ... existing methods
  create: async (data: CreateUserStoryDto): Promise<UserStory> => {
    const response = await axiosClient.post('/projects/${data.projectId}/user-stories', data);
    return response.data;
  },
};
```

- [ ] **Step 2: Write a test for `userStoryService.create`**

```typescript
import { userStoryService } from '@/infrastructure/services/userStoryService';
import { axiosClient } from '@/infrastructure/api/axios';

jest.mock('@/infrastructure/api/axios');

describe('userStoryService', () => {
  it('should call create API with correct parameters', async () => {
    const mockData = { title: 'Test Story', projectId: 1 };
    (axiosClient.post as jest.Mock).mockResolvedValue({ data: { id: 1, ...mockData } });

    const result = await userStoryService.create(mockData as any);

    expect(axiosClient.post).toHaveBeenCalledWith('/projects/1/user-stories', mockData);
    expect(result.title).toBe('Test Story');
  });
});
```

- [ ] **Step 3: Run test and commit**

```bash
npm test src/infrastructure/services/userStoryService.test.ts
git add src/infrastructure/services/userStoryService.ts tests/infrastructure/services/userStoryService.test.ts
git commit -m "feat: implement userStoryService.create and verify with test"
```

### Task 2: Implement Application Layer Hook (`useCreateUserStory`)

**Files:**
- Create: `src/features/user-stories/hooks/useCreateUserStory.ts`
- Test: `tests/features/user-stories/hooks/useCreateUserStory.test.ts`

- [ ] **Step 1: Write the failing test for the hook**

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCreateUserStory } from '@/features/user-stories/hooks/useCreateUserStory';
import { userStoryService } from '@/infrastructure/services/userStoryService';

jest.mock('@/infrastructure/services/userStoryService');

describe('useCreateUserStory', () => {
  it('should handle successful creation', async () => {
    (userStoryService.create as jest.Mock).mockResolvedValue({ id: 1, title: 'New Story' });
    const { result } = renderHook(() => useCreateUserStory(1)); // projectId

    await act(async () => {
      await result.current.create({ title: 'New Story', description: 'Desc' } as any);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBeNull();
  });
});
```

- [ ] **Step 2: Implement the hook**

```typescript
import { useState } from 'react';
import { userStoryService } from '@/infrastructure/services/userStoryService';
import { toast } from 'react-hot-toast';

export function useCreateUserStory(projectId: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await userStoryService.create({ ...data, projectId });
      setIsSuccess(true);
      toast.success('User story created successfully!');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to create user story';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return { create, isLoading, isSuccess, error };
}
```

- [ ] **Step 3: Run test and commit**

```bash
npm test src/features/user-stories/hooks/useCreate/useCreateUserStory.test.ts
git add src/features/user-stories/hooks/useCreateUserStory.ts tests/features/user-stories/hooks/useCreateUserStory.test.ts
git commit -m "feat: implement useCreateUserStory hook"
```

### Task 3: Implement Presentation Layer (`CreateUserStoryModal`)

**Files:**
- Create: `src/features/user-stories/components/CreateUserStoryModal.tsx`
- Test: `tests/features/user-stories/components/CreateUserStoryModal.test.tsx`

- [ ] **Step 1: Write the failing test for the modal**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateUserStoryModal } from '@/features/user-stories/components/CreateUserStoryModal';
import { useCreateUserStory } from '@/features/user-stories/hooks/useCreateUserStory';

jest.mock('@/features/user-stories/hooks/useCreateUserStory');

describe('CreateUserStoryModal', () => {
  it('should call create with form data on submit', async () => {
    const mockCreate = jest.fn();
    (useCreateUserStory as jest.Mock).mockReturnValue({
      create: mockCreate,
      isLoading: false,
      isSuccess: false,
      error: null,
    });

    render(
      <CreateUserStoryModal projectId={1} onSuccess={() => {}} />
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Story' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Story' }));
  });
});
```

- [ ] **Step 2: Implement the modal component**

```typescript
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateUserStory } from '@/features/user-stories/hooks/useCreateUserStory';

interface Props {
  projectId: number;
  sprintId?: number;
  onSuccess: () => void;
}

export function CreateUserStoryModal({ projectId, sprintId, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [storyPoints, setStoryPoints] = useState<string>('');
  const [statusId, setStatusId] = useState<string>('1'); // Default to first status
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');

  const { create, isLoading } = useCreateUserStory(projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create({
      title,
      description,
      storyPoints: Number(storyPoints),
      statusId: Number(statusId),
      acceptanceCriteria,
      sprintId: sprintId || null,
    });
    onSuccess();
  };

  return (
    <Dialog open={true}> {/* Simplified for implementation; in real app, controlled by parent */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create User Story</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="storyPoints" className="text-ml font-medium">Story Points</label>
              <Input id="storyPoints" type="number" value={storyPoints} onChange={(e) => setStoryPoints(e.target.value)} />
            </div>
            <div>
              <label htmlFor="statusId" className="text-sm font-medium">Status</label>
              <Select onValueChange={(v) => setStatusId(v)} value={statusId}>
                <SelectTrigger id="statusId">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Planned</SelectItem>
                  <SelectItem value="2">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label htmlFor="acceptanceCriteria" className="text-sm font-medium">Acceptance Criteria</label>
            <Textarea id="acceptanceCriteria" value={acceptanceCriteria} onChange={(e) => setAcceptanceCriteria(e.target.value)} />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create User Story'}
          </Boolean>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Run test and commit**

```bash
npm test src/features/user-stories/components/CreateUserStoryModal.test.tsx
git add src/features/user-stories/components/CreateUserStoryModal.tsx tests/features/user-stories/components/CreateUserStoryModal.test.tsx
git commit -m "feat: implement CreateUserStoryModal component"
```

### Task 4: Integrate Modal into Existing Components (`SprintsTab`, `Backlog`)

**Files:**
- Modify: `src/features/projects/components/SprintsTab.tsx`
- Modify: `src/features/projects/components/Backlog.tsx`

- [ ] **Step 1: Update `SprintsTab.tsx` to trigger modal with `sprintId`**

```typescript
// Inside SprintsTab component
const [isModalOpen, setIsModalOpen] = useState(false);

// ... inside JSX
<Button onClick={() => setIsModalOpen(true)}>Add User Story</Button>

{isModalOpen && (
  <CreateUserStoryModal 
    projectId={currentProjectId} 
    sprintId={activeSprintId} 
    onSuccess={() => {
      setIsModalOpen(false);
      refreshSprints();
    }} 
  />
)}
```

- [ ] **Step 2: Update `Backlog.tsx` to trigger modal without `sprintId`**

```typescript
// Inside Backlog component
const [isModalOpen, setIsModalOpen] = useState(false);

// ... inside JSX
<Button onClick={() => setIsModalOpen(true)}>Add User Story</Button>

{isModalOpen && (
  <CreateUserStoryModal 
    projectId={currentProjectId} 
    onSuccess={() => {
      setIsModalOpen(false);
      refreshBacklog();
    }} 
  />
)}
```

- [ ] **Step 3: Run lint/typecheck and commit**

```bash
npx tsc --noEmit && npm run lint
git add src/features/projects/components/SprintsTab.tsx src/features/projects/components/Backlog.tsx
git commit -m "feat: integrate CreateUserStoryModal into SprintsTab and Backlog"
```
