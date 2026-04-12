import api from '../api/axios';
import { ApiError } from '@/domain/types';
import { Result } from '@/domain/types';
import { handleApiCall } from '../api/apiHelper';
import { 
    UserStoryDto, 
    CreateUserStoryRequestDto, 
    UpdateUserStoryRequestDto 
} from '@/domain/entities/UserStory';

const BASE_URL = '/api/userstories';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    errors?: ApiError[];
}

export const userStoryService = {
    getBacklog: (projectId: number): Promise<Result<UserStoryDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<ApiResponse<UserStoryDto[]>>(`${BASE_URL}/backlog/${projectId}`);
            const data = response.data;
            if (data?.success) return data.data;
            throw data;
        }) as Promise<Result<UserStoryDto[]>>;
    },

    getByEpic: (epicId: number): Promise<Result<UserStoryDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<ApiResponse<UserStoryDto[]>>(`${BASE_URL}/epic/${epicId}`);
            const data = response.data;
            if (data?.success) return data.data;
            throw data;
        }) as Promise<Result<UserStoryDto[]>>;
    },

    getBySprint: (sprintId: number): Promise<Result<UserStoryDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<ApiResponse<UserStoryDto[]>>(`${BASE_URL}/sprint/${sprintId}`);
            const data = response.data;
            if (data?.success) return data.data;
            throw data;
        }) as Promise<Result<UserStoryDto[]>>;
    },

    getById: (id: number): Promise<Result<UserStoryDto>> => {
        return handleApiCall(async () => {
            const response = await api.get<ApiResponse<UserStoryDto>>(`${BASE_URL}/${id}`);
            const data = response.data;
            if (data?.success) return data.data;
            throw data;
        }) as Promise<Result<UserStoryDto>>;
    },

    create: (createData: CreateUserStoryRequestDto): Promise<Result<UserStoryDto>> => {
        return handleApiCall(async () => {
            const response = await api.post<ApiResponse<UserStoryDto>>(BASE_URL, createData);
            const data = response.data;
            if (data?.success) return data.data;
            throw data;
        }) as Promise<Result<UserStoryDto>>;
    },

    update: (id: number, updateData: UpdateUserStoryRequestDto): Promise<Result<UserStoryDto>> => {
        return handleApiCall(async () => {
            const response = await api.put<ApiResponse<UserStoryDto>>(`${BASE_URL}/${id}`, updateData);
            const data = response.data;
            if (data?.success) return data.data;
            throw data;
        }) as Promise<Result<UserStoryDto>>;
    },

    delete: (id: number): Promise<Result<null>> => {
        return handleApiCall(async () => {
            const response = await api.delete<ApiResponse<null>>(`${BASE_URL}/${id}`);
            const data = response.data;
            if (data?.success) return data.data;
            throw data;
        }) as Promise<Result<null>>;
    }
};
