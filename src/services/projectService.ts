import api from './api';
import { Project, CreateProjectDto, UpdateProjectDto } from '@/features/projects/types';

export const projectService = {
    getAll: async (): Promise<Project[]> => {
        const response = await api.get<Project[]>('/api/Projects');
        return response.data;
    },

    getById: async (id: number): Promise<Project> => {
        // Assuming there is an endpoint to get by ID, commonly RESTful API has /api/Projects/{id}
        // If not explicitly listed in requirements, we might need to rely on the list or assume standard REST.
        // The user mentioned PUT /api/Projects/{id}, so GET /api/Projects/{id} is likely exists or we can find it in the list.
        // For now, let's assume standard REST.
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

    searchUsers: async (term: string): Promise<import('@/features/projects/types').UserSearchResult[]> => {
        if (term.length < 3) return [];
        const response = await api.get<import('@/features/projects/types').UserSearchResult[]>('/api/Users/search', {
            params: { q: term } // Changed 'search' to 'q' based on Swagger documentation
        });
        return response.data;
    },

    assignUser: async (projectId: number, userId: string): Promise<void> => {
        await api.post(`/api/Projects/${projectId}/users`, { userIds: [userId] });
    },

    removeUser: async (projectId: number, userId: string): Promise<void> => {
        // Try path parameter first as it adheres to standard REST
        await api.delete(`/api/Projects/${projectId}/users/${userId}`);
    },

    getProjectUsers: async (projectId: number): Promise<import('@/features/projects/types').UserSearchResult[]> => {
        const response = await api.get<import('@/features/projects/types').UserSearchResult[]>(`/api/Projects/${projectId}/users`);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/Projects/${id}`);
    },
};
