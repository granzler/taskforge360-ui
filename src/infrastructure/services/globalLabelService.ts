import api from '../api/axios';
import { Result } from '@/domain/types';
import { handleApiCall } from '../api/apiHelper';
import { GlobalLabelDto, CreateLabelRequestDto, UpdateLabelRequestDto } from '@/domain/entities/GlobalLabel';

export type { GlobalLabelDto, CreateLabelRequestDto, UpdateLabelRequestDto };

export const globalLabelService = {
    getAll: (): Promise<Result<GlobalLabelDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<GlobalLabelDto[]>('/api/Labels');
            return response.data;
        });
    },

    getById: (id: number): Promise<Result<GlobalLabelDto>> => {
        return handleApiCall(async () => {
            const response = await api.get<GlobalLabelDto>(`/api/Labels/${id}`);
            return response.data;
        });
    },

    create: (dto: CreateLabelRequestDto): Promise<Result<GlobalLabelDto>> => {
        return handleApiCall(async () => {
            const response = await api.post<GlobalLabelDto>('/api/Labels', dto);
            return response.data;
        });
    },

    update: (id: number, dto: UpdateLabelRequestDto): Promise<Result<GlobalLabelDto>> => {
        return handleApiCall(async () => {
            const response = await api.put<GlobalLabelDto>(`/api/Labels/${id}`, dto);
            return response.data;
        });
    },

    delete: (id: number): Promise<Result<void>> => {
        return handleApiCall(async () => {
            await api.delete(`/api/Labels/${id}`);
        });
    },
};