import api from '../api/axios';
import { Sprint, SprintStatus, CreateSprintDto } from '@/domain/entities/Sprint';
import { Result } from '@/domain/types';
import { handleApiCall } from '../api/apiHelper';

export type { CreateSprintDto };

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

    delete: (sprintId: number): Promise<Result<void>> => {
        return handleApiCall(async () => {
            const response = await api.delete<void>(`/api/Sprints/${sprintId}`);
            return response.data;
        });
    },
};
