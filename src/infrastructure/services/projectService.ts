import api from '../api/axios';
import { 
    Project, 
    UserProject, 
    CreateProjectDto, 
    UpdateProjectDto
} from '@/domain/entities/Project';
import { UserSearchResult } from '@/domain/entities/User';
import { Result } from '@/domain/types';
import { handleApiCall } from '../api/apiHelper';

export const projectService = {
    getAll: (): Promise<Result<Project[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<Project[]>('/api/Projects');
            return response.data;
        });
    },

    getMyProjects: (): Promise<Result<UserProject[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<UserProject[]>('/api/Projects/me');
            return response.data;
        });
    },

    getById: (id: number): Promise<Result<Project>> => {
        return handleApiCall(async () => {
            const response = await api.get<Project>(`/api/Projects/${id}`);
            return response.data;
        });
    },

    create: (project: CreateProjectDto): Promise<Result<Project>> => {
        return handleApiCall(async () => {
            const response = await api.post<Project>('/api/Projects', project);
            return response.data;
        });
    },

    update: (id: number, project: UpdateProjectDto): Promise<Result<void>> => {
        return handleApiCall(async () => {
            await api.put(`/api/Projects/${id}`, project);
        });
    },

    searchUsers: (term: string): Promise<Result<UserSearchResult[]>> => {
        return handleApiCall(async () => {
            if (term.length < 3) return [];
            const response = await api.get<UserSearchResult[]>('/api/Users/search', {
                params: { q: term }
            });
            return response.data;
        });
    },

    assignUser: (projectId: number, userId: string, concurrencyVersion: number): Promise<Result<void>> => {
        return handleApiCall(async () => {
            await api.post(`/api/Projects/${projectId}/users`, { 
                userIds: [userId],
                concurrencyVersion 
            });
        });
    },

    removeUser: (projectId: number, userId: string): Promise<Result<void>> => {
        return handleApiCall(async () => {
            await api.delete(`/api/Projects/${projectId}/users/${userId}`);
        });
    },

    getProjectUsers: (projectId: number): Promise<Result<UserSearchResult[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<UserSearchResult[]>(`/api/Projects/${projectId}/users`);
            return response.data;
        });
    },

    delete: (id: number): Promise<Result<void>> => {
        return handleApiCall(async () => {
            await api.delete(`/api/Projects/${id}`);
        });
    },
};
