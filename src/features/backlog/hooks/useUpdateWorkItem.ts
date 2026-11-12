'use client';

import { useState } from 'react';
import { UpdateWorkItemRequestDto, WorkItemDto } from '@/domain/entities/WorkItem';
import { workItemService } from '@/infrastructure/services/workItemService';
import { toast } from 'react-hot-toast';
import { notifyResult } from '@/lib/utils/notify';

interface UseUpdateWorkItemOptions {
    onSuccess?: (item: WorkItemDto) => void;
    onError?: (error: string) => void;
}

export function useUpdateWorkItem(options?: UseUpdateWorkItemOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = async (id: number, data: UpdateWorkItemRequestDto): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await workItemService.update(id, data);
            if (notifyResult(result, {
                onSuccess: (item) => {
                    toast.success(`"${item.title}" updated!`);
                    options?.onSuccess?.(item);
                },
                onError: (msg) => {
                    setError(msg);
                    options?.onError?.(msg);
                }
            })) {
                return true;
            }
            return false;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Could not update work item. Please try again.';
            console.error('Failed to update work item (exception):', err);
            setError(errorMsg);
            toast.error(errorMsg);
            options?.onError?.(errorMsg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        update,
        isLoading,
        error,
    };
}
