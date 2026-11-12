'use client';

import { useState } from 'react';
import { CreateWorkItemRequestDto, WorkItemDto } from '@/domain/entities/WorkItem';
import { workItemService } from '@/infrastructure/services/workItemService';
import { toast } from 'react-hot-toast';
import { notifyResult } from '@/lib/utils/notify';
import { WorkItemType, WORK_ITEM_TYPE_LABELS } from '@/domain/types';

interface UseCreateWorkItemOptions {
    onSuccess?: (item: WorkItemDto) => void;
    onError?: (error: string) => void;
}

export function useCreateWorkItem(options?: UseCreateWorkItemOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = async (data: CreateWorkItemRequestDto): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await workItemService.create(data);
            if (notifyResult(result, {
                onSuccess: (item) => {
                    const typeLabel = WORK_ITEM_TYPE_LABELS[item.type as WorkItemType] || 'Work item';
                    toast.success(`${typeLabel} "${item.title}" created!`);
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
            const errorMsg = err instanceof Error ? err.message : 'Could not create work item. Please try again.';
            console.error('Failed to create work item (exception):', err);
            setError(errorMsg);
            toast.error(errorMsg);
            options?.onError?.(errorMsg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        create,
        isLoading,
        error,
    };
}
