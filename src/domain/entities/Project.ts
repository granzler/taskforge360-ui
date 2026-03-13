import { Sprint } from './Sprint';
import { Priority, Status } from '../types';

export interface ProjectUser {
    id: number;
    userId: string;
    userName?: string;
    displayName?: string;
    email?: string;
}

export interface WorkItem {
    id: number;
    title: string;
}

export interface Project {
    id: number;
    name: string;
    description: string;
    sprints: Sprint[];
    workItems: WorkItem[];
    projectUsers: ProjectUser[];
    sprintDurationDays: number;
}

export interface UserProject {
    id: number;
    name: string;
    sprintDurationDays: number;
}

export interface CreateProjectDto {
    name: string;
    description: string;
    sprintDurationDays: number;
}

export interface UpdateProjectDto {
    id: number;
    name: string;
    description: string;
    sprintDurationDays: number;
}

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
