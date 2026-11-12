import { WorkItemDto } from './WorkItem';

export interface EpicResponseDto {
    id: number;
    title: string;
    description: string;
    acceptanceCriteria: string;
    statusId: number;
    statusName: string;
    projectId: number;
    children: WorkItemDto[];            // Renamed from userStories
    priority?: number | string;
    concurrencyVersion: number;
}

export interface CreateEpicDto {
    title: string;
    description: string;
    acceptanceCriteria: string;
    priority: number;
    statusId: number;
    projectId: number;
}

export interface UpdateEpicDto {
    id: number;
    title: string;
    description: string;
    acceptanceCriteria: string;
    priority: number;
    statusId: number;
    projectId: number;
    concurrencyVersion: number;
}
