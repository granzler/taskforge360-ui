import { useQuery } from '@tanstack/react-query';
import { Sprint } from '@/domain/entities/Sprint';
import { sprintService } from '@/infrastructure/services/sprintService';

export function useSprints(projectId: number | undefined) {
    return useQuery<Sprint[]>({
        queryKey: ['sprints', projectId],
        queryFn: async () => {
            const result = await sprintService.getByProject(projectId!);
            if (!result.success) {
                throw new Error(result.errors.map(e => e.message).join(', '));
            }
            return result.data;
        },
        enabled: !!projectId,
    });
}
