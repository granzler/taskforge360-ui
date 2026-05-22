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
    concurrencyVersion: number;
}

export interface UserProject {
    id: number;
    name: string;
    sprintDurationDays: number;
    concurrencyVersion: number;
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
    concurrencyVersion: number;
}

export interface Epic {
    id: number;
    title: string;
    description: string;
    priority: Priority;
    status: Status;
    projectId: number;
    assigneeId?: string;
    concurrencyVersion: number;
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
    assigneeId?: string;
    concurrencyVersion: number;
}
