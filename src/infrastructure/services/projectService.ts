import api from '../api/axios';
import { 
    Project, 
    UserProject, 
    CreateProjectDto, 
    UpdateProjectDto
} from '@/domain/entities/Project';
import { UserSearchResult } from '@/domain/entities/User';

export const projectService = {
    getAll: async (): Promise<Project[]> => {
        const response = await api.get<Project[]>('/api/Projects');
        return response.data;
    },

    getMyProjects: async (): Promise<UserProject[]> => {
        const response = await api.get<UserProject[]>('/api/Projects/me');
        return response.data;
    },

    getById: async (id: number): Promise<Project> => {
        const response = await api.get<Project>(`/api/Projects/${id}`);
        return response.data;
    },

    create: async (project: CreateProjectDto): Promise<Project> => {
        const response = await api.post<Project>('/api/Projects', project);
        return response.data;
    },

    update: async (id: number, project: UpdateProjectDto): Promise<void> => {
        await api.put(`/api/Projects/${id}`, project);
    },

    searchUsers: async (term: string): Promise<UserSearchResult[]> => {
        if (term.length < 3) return [];
        const response = await api.get<UserSearchResult[]>('/api/Users/search', {
            params: { q: term }
        });
        return response.data;
    },

    assignUser: async (projectId: number, userId: string): Promise<void> => {
        await api.post(`/api/Projects/${projectId}/users`, { userIds: [userId] });
    },

    removeUser: async (projectId: number, userId: string): Promise<void> => {
        await api.delete(`/api/Projects/${projectId}/users/${userId}`);
    },

    getProjectUsers: async (projectId: number): Promise<UserSearchResult[]> => {
        const response = await api.get<UserSearchResult[]>(`/api/Projects/${projectId}/users`);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/Projects/${id}`);
    },
};
