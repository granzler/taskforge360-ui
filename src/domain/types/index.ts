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
