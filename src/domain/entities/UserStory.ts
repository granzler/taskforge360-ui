import { SubTask } from './Project';

export interface CreateUserStoryRequestDto {
    title: string;
    description?: string;
    epicId?: number;
    statusId: number;
    priority: number;
    sprintId?: number;
    projectId: number;
    storyPoints?: number;
    acceptanceCriteria?: string;
}

export interface UpdateUserStoryRequestDto {
    title: string;
    description?: string;
    epicId?: number;
    statusId: number;
    priority: number;
    sprintId?: number;
    projectId: number;
    storyPoints?: number;
    acceptanceCriteria?: string;
}

export interface UserStoryDto {
    id: number;
    title: string;
    description?: string;
    epicId?: number;
    epicTitle?: string;
    statusId: number;
    statusName: string;
    priority: number;
    sprintId?: number;
    sprintName?: string;
    projectId: number;
    storyPoints?: number;
    acceptanceCriteria?: string;
    subTasks?: SubTask[];
    assigneeId?: string;
}
