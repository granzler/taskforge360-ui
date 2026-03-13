import api from '../api/axios';
import { Sprint, SprintStatus } from '@/domain/entities/Sprint';

export interface CreateSprintDto {
    name: string;
    startDate: string;
    endDate: string;
    projectId: number;
}

export const sprintService = {
    getByProject: async (projectId: number): Promise<Sprint[]> => {
        const response = await api.get<Sprint[]>(`/api/Sprints/project/${projectId}`);
        return response.data;
    },

    create: async (dto: CreateSprintDto): Promise<Sprint> => {
        const response = await api.post<Sprint>('/api/Sprints', dto);
        return response.data;
    },

    getStatuses: async (): Promise<SprintStatus[]> => {
        const response = await api.get<SprintStatus[]>('/api/Sprints/statuses');
        return response.data;
    },
};
