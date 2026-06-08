import { useQuery } from '@tanstack/react-query';
import { GlobalLabelDto } from '@/domain/entities/GlobalLabel';
import { globalLabelService } from '@/infrastructure/services/globalLabelService';

interface UseLabelsOptions {
    autoFetch?: boolean;
}

interface UseLabelsReturn {
    labels: GlobalLabelDto[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useLabels(options: UseLabelsOptions = {}): UseLabelsReturn {
    const { autoFetch = true } = options;

    const { data, isLoading, error, refetch } = useQuery<GlobalLabelDto[], Error>({
        queryKey: ['labels'],
        queryFn: async () => {
            const result = await globalLabelService.getAll();
            if (!result.success) {
                throw new Error(result.errors.map(e => e.message).join(', '));
            }
            return result.data;
        },
        enabled: autoFetch,
    });

    return {
        labels: data ?? [],
        isLoading,
        error: error?.message ?? null,
        refetch: async () => { await refetch(); },
    };
}
