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

export type Status = 'To Do' | 'In Progress' | 'Review' | 'Done';

// ─── WorkItemType Enum ──────────────────────────────────────────
export enum WorkItemType {
    Story = 1,
    Task = 2,
    Bug = 3,
    Spike = 4,
}

export const WORK_ITEM_TYPE_LABELS: Record<WorkItemType, string> = {
    [WorkItemType.Story]: 'Story',
    [WorkItemType.Task]: 'Task',
    [WorkItemType.Bug]: 'Bug',
    [WorkItemType.Spike]: 'Spike',
};

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
export enum WorkItemStatus {
    Backlog = 6,
    ToDo = 7,
    InProgress = 8,
    InReview = 9,
    Testing = 10,
    Deploying = 11,
    ReadyForTesting = 12,
    // ID 13 (Refinement) — REMOVED by backend
    Done = 14,
    // ID 15 (Cancelled) — REMOVED by backend
}

export const WORK_ITEM_STATUS_LABELS: Record<WorkItemStatus, string> = {
    [WorkItemStatus.Backlog]: 'Backlog',
    [WorkItemStatus.ToDo]: 'To Do',
    [WorkItemStatus.InProgress]: 'In Progress',
    [WorkItemStatus.InReview]: 'In Review',
    [WorkItemStatus.Testing]: 'Testing',
    [WorkItemStatus.Deploying]: 'Deploying',
    [WorkItemStatus.ReadyForTesting]: 'Ready for Testing',
    [WorkItemStatus.Done]: 'Done',
};

export const WORK_ITEM_STATUS_OPTIONS = [
    { id: WorkItemStatus.Backlog, label: 'Backlog' },
    { id: WorkItemStatus.ToDo, label: 'To Do' },
    { id: WorkItemStatus.InProgress, label: 'In Progress' },
    { id: WorkItemStatus.InReview, label: 'In Review' },
    { id: WorkItemStatus.Testing, label: 'Testing' },
    { id: WorkItemStatus.Deploying, label: 'Deploying' },
    { id: WorkItemStatus.ReadyForTesting, label: 'Ready for Testing' },
    { id: WorkItemStatus.Done, label: 'Done' },
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
