import api from '../api/axios';
import { Sprint, SprintStatus } from '@/domain/entities/Sprint';
import { Result } from '@/domain/types';
import { handleApiCall } from '../api/apiHelper';

export interface CreateSprintDto {
    name: string;
    startDate: string;
    endDate: string;
    projectId: number;
}

export const sprintService = {
    getByProject: (projectId: number): Promise<Result<Sprint[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<Sprint[]>(`/api/Sprints/project/${projectId}`);
            return response.data;
        });
    },

    create: (dto: CreateSprintDto): Promise<Result<Sprint>> => {
        return handleApiCall(async () => {
            const response = await api.post<Sprint>('/api/Sprints', dto);
            return response.data;
        });
    },

    getStatuses: (): Promise<Result<SprintStatus[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<SprintStatus[]>('/api/Sprints/statuses');
            return response.data;
        });
    },
};
