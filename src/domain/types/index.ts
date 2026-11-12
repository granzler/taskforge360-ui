export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export enum WorkItemPriority {
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

export const WORK_ITEM_PRIORITY_LABELS: Record<WorkItemPriority, string> = {
    [WorkItemPriority.Low]: 'Low',
    [WorkItemPriority.Medium]: 'Medium',
    [WorkItemPriority.High]: 'High',
    [WorkItemPriority.Critical]: 'Critical',
};

export const getWorkItemPriorityLabel = (priority: number | string | undefined): string => {
    if (priority === undefined) return 'Medium';
    if (typeof priority === 'string') return priority;
    return WORK_ITEM_PRIORITY_LABELS[priority as WorkItemPriority] ?? 'Medium';
};

/**
 * Display status of a work item. Kept as a union so callers can pass a status
 * label straight to `getStatusIcon`. Includes the Epic flow, the shared child
 * flow (Story/Bug/Spike/Task) and a couple of legacy values.
 */
export type Status =
    | 'Backlog' | 'To Do' | 'In Progress' | 'Ready for Review' | 'In Review'
    | 'Needs Revision' | 'Ready for Test' | 'In Test' | 'Done' | 'Blocked'
    | 'Review' | 'Cancelled';

// ─── WorkItemType Enum ──────────────────────────────────────────
export enum WorkItemType {
    Epic = 0,       // Epics live in their own controller; the value mirrors the backend enum
    Story = 1,
    Task = 2,
    Bug = 3,
    Spike = 4,
}

export const WORK_ITEM_TYPE_LABELS: Record<WorkItemType, string> = {
    [WorkItemType.Epic]: 'Epic',
    [WorkItemType.Story]: 'Story',
    [WorkItemType.Task]: 'Task',
    [WorkItemType.Bug]: 'Bug',
    [WorkItemType.Spike]: 'Spike',
};

/** Options for creating/editing work items — Epics are handled by their own form. */
export const WORK_ITEM_TYPE_OPTIONS = [
    { id: WorkItemType.Story, label: 'Story' },
    { id: WorkItemType.Task, label: 'Task' },
    { id: WorkItemType.Bug, label: 'Bug' },
    { id: WorkItemType.Spike, label: 'Spike' },
];

// ─── Epic Status ────────────────────────────────────────────────
export enum EpicStatus {
    Backlog = 1,
    InProgress = 2,
    ReadyForReview = 3,
    Done = 4,
    Cancelled = 5
}

export const EPIC_STATUS_LABELS: Record<EpicStatus, string> = {
    [EpicStatus.Backlog]: 'Backlog',
    [EpicStatus.InProgress]: 'In Progress',
    [EpicStatus.ReadyForReview]: 'Ready for Review',
    [EpicStatus.Done]: 'Done',
    [EpicStatus.Cancelled]: 'Cancelled',
};

export const EPIC_STATUS_OPTIONS = [
    { id: EpicStatus.Backlog, label: 'Backlog' },
    { id: EpicStatus.InProgress, label: 'In Progress' },
    { id: EpicStatus.ReadyForReview, label: 'Ready for Review' },
    { id: EpicStatus.Done, label: 'Done' },
    { id: EpicStatus.Cancelled, label: 'Cancelled' },
];

// ─── WorkItem Status (shared by Story, Bug, Spike, Task) ────────
// Ids match the seeded rows in the backend WorkItemStatus table
// (TaskForge360.Data/Entities/Mappings/WorkItemStatusMap.cs).
export enum WorkItemStatus {
    Backlog = 6,
    ToDo = 7,
    InProgress = 8,
    ReadyForReview = 9,
    InReview = 10,
    NeedsRevision = 11,
    ReadyForTest = 12,
    InTest = 13,
    Done = 14,
    Blocked = 15,
}

export const WORK_ITEM_STATUS_LABELS: Record<WorkItemStatus, string> = {
    [WorkItemStatus.Backlog]: 'Backlog',
    [WorkItemStatus.ToDo]: 'To Do',
    [WorkItemStatus.InProgress]: 'In Progress',
    [WorkItemStatus.ReadyForReview]: 'Ready for Review',
    [WorkItemStatus.InReview]: 'In Review',
    [WorkItemStatus.NeedsRevision]: 'Needs Revision',
    [WorkItemStatus.ReadyForTest]: 'Ready for Test',
    [WorkItemStatus.InTest]: 'In Test',
    [WorkItemStatus.Done]: 'Done',
    [WorkItemStatus.Blocked]: 'Blocked',
};

export const WORK_ITEM_STATUS_OPTIONS = [
    { id: WorkItemStatus.Backlog, label: 'Backlog' },
    { id: WorkItemStatus.ToDo, label: 'To Do' },
    { id: WorkItemStatus.InProgress, label: 'In Progress' },
    { id: WorkItemStatus.ReadyForReview, label: 'Ready for Review' },
    { id: WorkItemStatus.InReview, label: 'In Review' },
    { id: WorkItemStatus.NeedsRevision, label: 'Needs Revision' },
    { id: WorkItemStatus.ReadyForTest, label: 'Ready for Test' },
    { id: WorkItemStatus.InTest, label: 'In Test' },
    { id: WorkItemStatus.Done, label: 'Done' },
    { id: WorkItemStatus.Blocked, label: 'Blocked' },
];

// ─── Backward-compat aliases ────────────────────────────────────
/** @deprecated Use WorkItemStatus instead */
export const UserStoryStatus = WorkItemStatus;
/** @deprecated Use WORK_ITEM_STATUS_LABELS instead */
export const USER_STORY_STATUS_LABELS = WORK_ITEM_STATUS_LABELS;

// ─── API Types ──────────────────────────────────────────────────
export interface ApiError {
  code: string;
  message: string;
  type: string;
}

export interface ApiErrorResponse {
  traceId: string;
  errors: ApiError[];
}

export type Result<T> =
  | { success: true; data: T }
  | { success: false; errors: ApiError[]; traceId?: string };
