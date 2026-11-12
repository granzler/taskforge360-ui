import api from '../api/axios';
import { Result } from '@/domain/types';
import { handleApiCall } from '../api/apiHelper';
import {
    WorkItemDto,
    WorkItemStatusDto,
    CreateWorkItemRequestDto,
    UpdateWorkItemRequestDto,
} from '@/domain/entities/WorkItem';

export const workItemService = {
    // ─── List endpoints (with ?type= query param) ──────────────

    getStories: (): Promise<Result<WorkItemDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<WorkItemDto[]>('/api/workitems/stories');
            return response.data;
        });
    },

    getBugs: (): Promise<Result<WorkItemDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<WorkItemDto[]>('/api/workitems/bugs');
            return response.data;
        });
    },

    getSpikes: (): Promise<Result<WorkItemDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<WorkItemDto[]>('/api/workitems/spikes');
            return response.data;
        });
    },

    getTasks: (): Promise<Result<WorkItemDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<WorkItemDto[]>('/api/workitems/tasks');
            return response.data;
        });
    },

    getByType: (type: string): Promise<Result<WorkItemDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<WorkItemDto[]>('/api/workitems', {
                params: { type },
            });
            return response.data;
        });
    },

    // ─── Filtered endpoints ────────────────────────────────────

    getBacklog: (projectId: number, type: string = 'story'): Promise<Result<WorkItemDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<WorkItemDto[]>(`/api/workitems/backlog/${projectId}`, {
                params: { type },
            });
            return response.data;
        });
    },

    getByProject: (projectId: number, type: string = 'story'): Promise<Result<WorkItemDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<WorkItemDto[]>(`/api/workitems/project/${projectId}`, {
                params: { type },
            });
            return response.data;
        });
    },

    getByEpic: (epicId: number, type: string = 'story'): Promise<Result<WorkItemDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<WorkItemDto[]>(`/api/workitems/epic/${epicId}`, {
                params: { type },
            });
            return response.data;
        });
    },

    getBySprint: (sprintId: number, type: string = 'story'): Promise<Result<WorkItemDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<WorkItemDto[]>(`/api/workitems/sprint/${sprintId}`, {
                params: { type },
            });
            return response.data;
        });
    },

    // ─── Child work items (subtasks) of a parent ────────────────
    getTasksByParent: (parentId: number): Promise<Result<WorkItemDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<WorkItemDto[]>(`/api/workitems/parent/${parentId}`, {
                params: { type: 'task' },
            });
            return response.data;
        });
    },

    // ─── Status lookup (seeded WorkItemStatus rows) ─────────────
    getStatuses: (): Promise<Result<WorkItemStatusDto[]>> => {
        return handleApiCall(async () => {
            const response = await api.get<WorkItemStatusDto[]>('/api/workitems/statuses');
            return response.data;
        });
    },

    // ─── CRUD ──────────────────────────────────────────────────

    getById: (id: number): Promise<Result<WorkItemDto>> => {
        return handleApiCall(async () => {
            const response = await api.get<WorkItemDto>(`/api/workitems/${id}`);
            return response.data;
        });
    },

    create: (dto: CreateWorkItemRequestDto): Promise<Result<WorkItemDto>> => {
        return handleApiCall(async () => {
            const response = await api.post<WorkItemDto>('/api/workitems', dto);
            return response.data;
        });
    },

    update: (id: number, dto: UpdateWorkItemRequestDto): Promise<Result<WorkItemDto>> => {
        return handleApiCall(async () => {
            const response = await api.put<WorkItemDto>(`/api/workitems/${id}`, dto);
            return response.data;
        });
    },

    delete: (id: number): Promise<Result<null>> => {
        return handleApiCall(async () => {
            await api.delete(`/api/workitems/${id}`);
            return null;
        });
    },
};
