import { GlobalLabelDto } from './GlobalLabel';
import { WorkItemType } from '@/domain/types';

// ─── Create DTO ─────────────────────────────────────────────────
export interface CreateWorkItemRequestDto {
    type: WorkItemType;            // REQUIRED — "Story", "Bug", "Spike", "Task"
    title: string;
    projectId: number;
    priority: number;
    statusId: number;
    concurrencyVersion: number;    // NEW

    // OPTIONAL
    description?: string;
    acceptanceCriteria?: string;
    storyPoints?: number;
    sprintId?: number;
    parentId?: number;             // Replaces epicId (for Story/Bug/Spike) AND userStoryId (for Task)
    assignedTo?: string;
    labelIds?: number[];
}

// ─── Update DTO ─────────────────────────────────────────────────
export interface UpdateWorkItemRequestDto {
    title: string;
    description?: string;
    acceptanceCriteria?: string;
    storyPoints?: number;
    priority: number;
    projectId: number;
    statusId: number;
    concurrencyVersion: number;
    assignedTo?: string;
    sprintId?: number;
    parentId?: number;
    labelIds?: number[];
}

// ─── Response DTO (unified) ─────────────────────────────────────
export interface WorkItemDto {
    id: number;
    type: WorkItemType;               // NEW — "Story", "Bug", "Spike", "Task"
    title: string;
    description?: string;
    acceptanceCriteria?: string;
    priority: number;
    projectId: number;
    projectName?: string;
    statusId: number;
    statusName: string;
    statusCategory?: string;          // NEW
    storyPoints?: number;
    sprintId?: number;
    sprintName?: string;
    parentId?: number;                // NEW — replaces epicId + userStoryId
    parentTitle?: string;              // NEW
    parentType?: string;               // NEW — "Epic", "Story", "Bug", or "Spike"
    assignedTo?: string;
    labels?: GlobalLabelDto[];
    createdAt?: string;                // NEW
    createdBy?: string;                // NEW
    updatedAt?: string;                // NEW
    concurrencyVersion: number;
}
