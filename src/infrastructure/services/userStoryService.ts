import api from '../api/axios';
import { Result } from '@/domain/types';
import { handleApiCall } from '../api/apiHelper';
import { 
    UserStoryDto, 
    CreateUserStoryRequestDto, 
    UpdateUserStoryRequestDto 
} from '@/domain/entities/UserStory';

const BASE_URL = '/api/userstories';

export const userStoryService = {
    getBacklog: (projectId: number): Promise<Result<UserStoryDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<any>(`${BASE_URL}/backlog/${projectId}`);
            if (response.data && response.data.isSuccess !== undefined) {
                if (response.data.isSuccess) return response.data.value;
                throw response.data; // Handled by API helper if Error
            }
            return response.data;
        });
    },

    getByEpic: (epicId: number): Promise<Result<UserStoryDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<any>(`${BASE_URL}/epic/${epicId}`);
            if (response.data && response.data.isSuccess !== undefined) {
                if (response.data.isSuccess) return response.data.value;
                throw response.data;
            }
            return response.data;
        });
    },

    getBySprint: (sprintId: number): Promise<Result<UserStoryDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<any>(`${BASE_URL}/sprint/${sprintId}`);
            if (response.data && response.data.isSuccess !== undefined) {
                if (response.data.isSuccess) return response.data.value;
                throw response.data;
            }
            return response.data;
        });
    },

    getById: (id: number): Promise<Result<UserStoryDto>> => {
        return handleApiCall(async () => {
            const response = await api.get<any>(`${BASE_URL}/${id}`);
            if (response.data && response.data.isSuccess !== undefined) {
                if (response.data.isSuccess) return response.data.value;
                throw response.data;
            }
            return response.data;
        });
    },

    create: (data: CreateUserStoryRequestDto): Promise<Result<UserStoryDto>> => {
        return handleApiCall(async () => {
            const response = await api.post<any>(BASE_URL, data);
            if (response.data && response.data.isSuccess !== undefined) {
                if (response.data.isSuccess) return response.data.value;
                throw response.data;
            }
            return response.data;
        });
    },

    update: (id: number, data: UpdateUserStoryRequestDto): Promise<Result<UserStoryDto>> => {
        return handleApiCall(async () => {
            const response = await api.put<any>(`${BASE_URL}/${id}`, data);
            if (response.data && response.data.isSuccess !== undefined) {
                if (response.data.isSuccess) return response.data.value;
                throw response.data;
            }
            return response.data;
        });
    },

    delete: (id: number): Promise<Result<null>> => {
        return handleApiCall(async () => {
            const response = await api.delete<any>(`${BASE_URL}/${id}`);
            if (response.data && response.data.isSuccess !== undefined) {
                if (response.data.isSuccess) return response.data.value;
                throw response.data;
            }
            return response.data;
        });
    }
};
