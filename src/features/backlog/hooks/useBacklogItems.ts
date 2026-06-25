import { useQuery } from '@tanstack/react-query';
import { WorkItemDto } from '@/domain/entities/WorkItem';
import { workItemService } from '@/infrastructure/services/workItemService';

export function useBacklogItems(projectId: number | undefined, sprintIds: number[], type: string = 'story') {
    return useQuery<WorkItemDto[]>({
        queryKey: ['backlog-items', projectId, type, ...sprintIds],
        queryFn: async () => {
            const allItems: WorkItemDto[] = [];

            const backlogResult = await workItemService.getBacklog(projectId!, type);
            if (backlogResult.success) {
                allItems.push(...backlogResult.data);
            }

            const sprintResults = await Promise.all(
                sprintIds.map(id => workItemService.getBySprint(id, type))
            );
            for (const result of sprintResults) {
                if (result.success) {
                    allItems.push(...result.data);
                }
            }

            return allItems;
        },
        enabled: !!projectId,
    });
}
