import { useQuery } from '@tanstack/react-query';
import { WorkItemStatusDto } from '@/domain/entities/WorkItem';
import { WorkItemType, WORK_ITEM_STATUS_OPTIONS } from '@/domain/types';
import { workItemService } from '@/infrastructure/services/workItemService';

export interface StatusOption {
    id: number;
    label: string;
}

/**
 * Status options for child work items (Story, Bug, Spike, Task).
 *
 * Source of truth is the seeded `WorkItemStatus` lookup table exposed by
 * `GET /api/workitems/statuses`; the local `WORK_ITEM_STATUS_OPTIONS` list is
 * only used while the query is loading or unavailable.
 */
export function useWorkItemStatuses() {
    const query = useQuery<WorkItemStatusDto[]>({
        queryKey: ['workitem-statuses'],
        queryFn: async () => {
            const result = await workItemService.getStatuses();
            if (!result.success) {
                throw new Error(result.errors.map(e => e.message).join(', '));
            }
            return result.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    const childStatuses = (query.data ?? []).filter(s => s.workItemType !== WorkItemType.Epic);
    const options: StatusOption[] =
        childStatuses.length > 0
            ? childStatuses.map(s => ({ id: s.id, label: s.name }))
            : WORK_ITEM_STATUS_OPTIONS;

    return {
        options,
        isLoading: query.isLoading,
        isError: query.isError,
    };
}
