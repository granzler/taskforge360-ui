'use client';

import { useState } from 'react';
import { workItemService } from '@/infrastructure/services/workItemService';
import { toast } from 'react-hot-toast';
import { notifyResult } from '@/lib/utils/notify';

interface UseDeleteWorkItemOptions {
    onSuccess?: (id: number) => void;
    onError?: (error: string) => void;
}

export function useDeleteWorkItem(options?: UseDeleteWorkItemOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const remove = async (id: number, title: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await workItemService.delete(id);
            if (notifyResult(result, {
                success: `"${title}" deleted.`,
                onSuccess: () => options?.onSuccess?.(id),
                onError: (msg) => {
                    setError(msg);
                    options?.onError?.(msg);
                },
            })) {
                return true;
            }
            return false;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Could not delete work item. Please try again.';
            console.error('Failed to delete work item (exception):', err);
            setError(errorMsg);
            toast.error(errorMsg);
            options?.onError?.(errorMsg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        remove,
        isLoading,
        error,
    };
}
