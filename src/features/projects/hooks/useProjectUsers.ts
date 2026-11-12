import { useQuery } from '@tanstack/react-query';
import { UserSearchResult } from '@/domain/entities/User';
import { projectService } from '@/infrastructure/services/projectService';

/**
 * Team members of a project, cached per project id.
 *
 * Work items only persist the Keycloak id of their assignee (`assignedTo`), so
 * the UI resolves it against the project team instead of showing the raw GUID.
 * The query is shared by every avatar on screen, so a list of subtasks only
 * triggers a single request.
 */
export function useProjectUsers(projectId: number | undefined) {
    return useQuery<UserSearchResult[]>({
        queryKey: ['project-users', projectId],
        queryFn: async () => {
            const result = await projectService.getProjectUsers(projectId!);
            if (!result.success) {
                throw new Error(result.errors.map(e => e.message).join(', '));
            }
            return result.data;
        },
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });
}
