import api from '../api/axios';
import { SubTask } from '@/domain/entities/Project';
import { Result } from '@/domain/types';
import { handleApiCall } from '../api/apiHelper';

export interface CreateSubTaskDto {
    title: string;
    description?: string;
    priority?: number;
    userStoryId: number;
}

export interface UpdateSubTaskDto {
    id: number;
    title: string;
    description?: string;
    priority?: number;
    statusId?: number;
    concurrencyVersion: number;
}

export const subtaskService = {
    getByUserStory: (userStoryId: number): Promise<Result<SubTask[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<SubTask[]>(`/api/SubTasks/userstory/${userStoryId}`);
            return response.data;
        });
    },

    create: (dto: CreateSubTaskDto): Promise<Result<SubTask>> => {
        return handleApiCall(async () => {
            const response = await api.post<SubTask>('/api/SubTasks', dto);
            return response.data;
        });
    },

    update: (id: number, dto: UpdateSubTaskDto): Promise<Result<SubTask>> => {
        return handleApiCall(async () => {
            const response = await api.put<SubTask>(`/api/SubTasks/${id}`, dto);
            return response.data;
        });
    },

    delete: (id: number): Promise<Result<void>> => {
        return handleApiCall(async () => {
            const response = await api.delete<void>(`/api/SubTasks/${id}`);
            return response.data;
        });
    },
};
