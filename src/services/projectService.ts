import api from './api';
import { Project, CreateProjectDto, UpdateProjectDto } from '@/types';

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

    // Add delete if needed later, though not explicitly requested in "create, list, update"
};
