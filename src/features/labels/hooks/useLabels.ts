import { useState, useEffect, useCallback } from 'react';
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

    const [labels, setLabels] = useState<GlobalLabelDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLabels = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await globalLabelService.getAll();
            if (result.success) {
                setLabels(result.data);
            } else {
                setError(result.errors.map(e => e.message).join(', '));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch labels');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchLabels();
        }
    }, [autoFetch, fetchLabels]);

    return {
        labels,
        isLoading,
        error,
        refetch: fetchLabels,
    };
}