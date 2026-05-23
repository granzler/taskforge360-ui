import { useQuery } from '@tanstack/react-query';
import { EpicResponseDto } from '@/domain/entities/Epic';
import { epicService } from '@/infrastructure/services/epicService';

export function useEpicsByProject(projectId: number | undefined) {
    return useQuery<EpicResponseDto[]>({
        queryKey: ['epics', projectId],
        queryFn: async () => {
            const result = await epicService.getByProject(projectId!);
            if (!result.success) {
                throw new Error(result.errors.map(e => e.message).join(', '));
            }
            return result.data;
        },
        enabled: !!projectId,
    });
}
