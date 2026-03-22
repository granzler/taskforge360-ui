export interface SubTaskDto {
    id: number;
    title: string;
    description: string;
    userStoryId: number;
}

export interface UserStoryDto {
    id: number;
    title: string;
    description: string;
    epicId: number;
    subTasks: SubTaskDto[];
    storyPoints: number;
    acceptanceCriteria: string;
    statusId?: number;
    statusName?: string;
    priority?: number | string;
}

export interface EpicResponseDto {
    id: number;
    title: string;
    description: string;
    acceptanceCriteria: string;
    statusId: number;
    statusName: string;
    projectId: number;
    userStories: UserStoryDto[];
    priority?: number | string;
    updatedAt?: string;
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
}
