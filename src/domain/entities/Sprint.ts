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

export interface CreateSprintDto {
    name: string;
    startDate: string;
    endDate: string;
    projectId: number;
}
