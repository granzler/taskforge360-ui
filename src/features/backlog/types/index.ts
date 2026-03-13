export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'To Do' | 'In Progress' | 'Review' | 'Done';

export interface Epic {
    id: number;
    title: string;
    description: string;
    priority: Priority;
    status: Status;
    projectId: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    assigneeId?: string;
}

export interface UserStory {
    id: number;
    title: string;
    description: string;
    priority: Priority;
    status: Status;
    epicId?: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    assigneeId?: string;
    sprintId?: number;
    storyPoints: number;
    labelId?: number;
    acceptanceCriteria: string;
}

export interface SubTask {
    id: number;
    title: string;
    description: string;
    priority: Priority;
    status: Status;
    startDate?: string;
    endDate?: string;
    userStoryId: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    assigneeId?: string;
}

export interface SprintStatus {
    id: number;
    name: string;
}

export interface Sprint {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    projectId: number;
    status: SprintStatus;
    velocity: number;
}
