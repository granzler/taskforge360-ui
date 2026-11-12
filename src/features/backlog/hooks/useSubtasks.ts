import { useQuery } from '@tanstack/react-query';
import { WorkItemDto } from '@/domain/entities/WorkItem';
import { workItemService } from '@/infrastructure/services/workItemService';

interface UseSubtasksOptions {
    /** Extra switch on top of `enabled` (e.g. Tasks cannot have subtasks). */
    enabled?: boolean;
}

/**
 * Child Tasks (subtasks) of a Story, Bug or Spike.
 *
 * Every consumer shares the `['workitem-subtasks', parentId]` key, so the list
 * is fetched once per parent and refreshed together on invalidation.
 */
export function useSubtasks(parentId: number | undefined, options?: UseSubtasksOptions) {
    return useQuery<WorkItemDto[]>({
        queryKey: ['workitem-subtasks', parentId],
        queryFn: async () => {
            const result = await workItemService.getTasksByParent(parentId!);
            if (!result.success) {
                throw new Error(result.errors.map(e => e.message).join(', '));
            }
            return result.data;
        },
        enabled: !!parentId && (options?.enabled ?? true),
    });
}
