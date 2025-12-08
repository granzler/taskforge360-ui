export interface Sprint {
    id: number;
    name: string;
    // Add other properties as needed based on backend, keeping it minimal for now based on DTO provided
}

export interface WorkItem {
    id: number;
    title: string;
    // Add other properties as needed
}

export interface ProjectUser {
    id: number;
    userId: string;
    // Add other properties as needed
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
