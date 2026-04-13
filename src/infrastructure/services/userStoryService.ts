import api from '../api/axios';
import { Result } from '@/domain/types';
import { handleApiCall } from '../api/apiHelper';
import { 
    UserStoryDto, 
    CreateUserStoryRequestDto, 
    UpdateUserStoryRequestDto 
} from '@/domain/entities/UserStory';

const BASE_URL = '/api/UserStories';

export const userStoryService = {
    getBacklog: (projectId: number): Promise<Result<UserStoryDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<UserStoryDto[]>(`${BASE_URL}/backlog/${projectId}`);
            return response.data;
        });
    },

    getByEpic: (epicId: number): Promise<Result<UserStoryDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<UserStoryDto[]>(`${BASE_URL}/epic/${epicId}`);
            return response.data;
        });
    },

    getBySprint: (sprintId: number): Promise<Result<UserStoryDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<UserStoryDto[]>(`${BASE_URL}/sprint/${sprintId}`);
            return response.data;
        });
    },

    getById: (id: number): Promise<Result<UserStoryDto>> => {
        return handleApiCall(async () => {
            const response = await api.get<UserStoryDto>(`${BASE_URL}/${id}`);
            return response.data;
        });
    },

    create: (createData: CreateUserStoryRequestDto): Promise<Result<UserStoryDto>> => {
        return handleApiCall(async () => {
            const response = await api.post<UserStoryDto>(BASE_URL, createData);
            return response.data;
        });
    },

    update: (id: number, updateData: UpdateUserStoryRequestDto): Promise<Result<UserStoryDto>> => {
        return handleApiCall(async () => {
            const response = await api.put<UserStoryDto>(`${BASE_URL}/${id}`, updateData);
            return response.data;
        });
    },

    delete: (id: number): Promise<Result<null>> => {
        return handleApiCall(async () => {
            await api.delete(`${BASE_URL}/${id}`);
            return null;
        });
    }
};