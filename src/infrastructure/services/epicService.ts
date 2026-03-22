import api from '../api/axios';
import { Result } from '@/domain/types';
import { handleApiCall } from '../api/apiHelper';
import { EpicResponseDto, CreateEpicDto, UpdateEpicDto } from '@/domain/entities/Epic';

export type { CreateEpicDto, UpdateEpicDto };

export const epicService = {
    getByProject: (projectId: number): Promise<Result<EpicResponseDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<EpicResponseDto[]>(`/api/Epics/project/${projectId}`);
            return response.data;
        });
    },

    getById: (id: number): Promise<Result<EpicResponseDto>> => {
        return handleApiCall(async () => {
            const response = await api.get<EpicResponseDto>(`/api/Epics/${id}`);
            return response.data;
        });
    },

    create: (dto: CreateEpicDto): Promise<Result<EpicResponseDto>> => {
        return handleApiCall(async () => {
            const response = await api.post<EpicResponseDto>('/api/Epics', dto);
            return response.data;
        });
    },

    update: (id: number, dto: UpdateEpicDto): Promise<Result<EpicResponseDto>> => {
        return handleApiCall(async () => {
            const response = await api.put<EpicResponseDto>(`/api/Epics/${id}`, dto);
            return response.data;
        });
    }
};
