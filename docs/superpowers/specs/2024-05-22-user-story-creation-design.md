# Design Doc: User Story Creation Modal

## Overview
Implementation of a centralized and contextual `CreateUserStoryModal` component to allow users to create new user stories within the TaskForge30 application. The modal will support creation both from a specific Sprint context (pre-assigned) and from the general Backlog (unassigned).

## Goals
- Provide a consistent UI/UX following existing design patterns (`rounded-xl`, `shadow-lg`).
- Enable quick creation of stories within a Sprint.
- Allow flexible creation of stories in the Backlog with optional Sprint assignment.
- Ensure all essential fields (Title, Description, Story Points, Status, Acceptance Criteria) are captured.

## Context & Constraints
- **Project Context**: The modal must always be associated with the current `projectId`.
- **Sprint Context**: 
    - If launched from `SprintsTab`, the `sprintId` is pre-filled and read-only.
    - If launched from `Backlog`, the `sprintId` is optional and selectable via a dropdown.
- **Architecture**: Follow Clean Architecture (Presentation $\rightarrow$ Application $\rightarrow$ Domain).

## Technical Design

### 1. Component Structure
- **`CreateUserStoryModal.tsx`** (Presentation Layer):
    - Uses existing primitives (`Input`, `Textarea`, `Select`, `Button`).
    - Props: `projectId: number`, `sprintId?: number`, `onSuccess: () => void`.
- **`useCreateUserStory.ts`** (Application Layer/Hook):
    - Handles the logic of calling the `userStoryService`.
    - Manages loading and error states.

### 2. Data Model (Fields)
| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | The name/summary of the story. |
| `description` | `string` | Detailed explanation of the requirement. |
| `storyPoints` | `number` | Estimated effort. |
| `statusId` | `number` | Initial status (e.g., Planned). |
| `acceptanceCriteria` | `string` | List of criteria to meet for completion. |
| `sprintId` | `number \| null` | The ID of the assigned sprint (optional). |
| `projectId` | `number` | The parent project ID. |

### 3. UI/UX Flow
1. **Trigger**: User clicks "Add User Story" in `SprintsTab` or Backlog.
2. **Modal Appearance**:
    - Smooth entry animation (`animate-in fade-in zoom-in-95`).
    - Form fields populated based on context.
3. **Submission**:
    - Validation: Ensure `title` and `description` are present.
    - API Call: `userStoryService.create(...)`.
    - Feedback: `toast.success` or `toast.error`.
4. **Cleanup**: Close modal and refresh the parent list/context.

### 4. Error Handling
- Handle network errors via `try/catch` in the service layer.
- Display descriptive error messages using `react-hot-toast`.
- Prevent duplicate submissions by disabling the "Create" button during loading.

## Implementation Plan (Draft)
- [ ] Create `CreateUserStoryModal` component.
- [ ] Implement form logic with standard state or `react-hook-form`.
- [ ] Integrate with `userStoryService`.
- [ ] Update `SprintsTab` and `Backlog` components to trigger the modal.
