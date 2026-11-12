import { useQuery } from '@tanstack/react-query';
import { WorkItemDto } from '@/domain/entities/WorkItem';
import { workItemService } from '@/infrastructure/services/workItemService';

export function useWorkItem(id: number | undefined) {
    return useQuery<WorkItemDto>({
        queryKey: ['workitem', id],
        queryFn: async () => {
            const result = await workItemService.getById(id!);
            if (!result.success) {
                throw new Error(result.errors.map(e => e.message).join(', '));
            }
            return result.data;
        },
        enabled: !!id,
    });
}
