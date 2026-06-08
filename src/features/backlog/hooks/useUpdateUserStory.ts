'use client';

import { useState } from 'react';
import { UpdateUserStoryRequestDto, UserStoryDto } from '@/domain/entities/UserStory';
import { userStoryService } from '@/infrastructure/services/userStoryService';
import { toast } from 'react-hot-toast';
import { notifyResult } from '@/lib/utils/notify';

interface UseUpdateUserStoryOptions {
    onSuccess?: (story: UserStoryDto) => void;
    onError?: (error: string) => void;
}

export function useUpdateUserStory(options?: UseUpdateUserStoryOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = async (id: number, data: UpdateUserStoryRequestDto): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await userStoryService.update(id, data);
            if (notifyResult(result, {
                onSuccess: (story) => {
                    toast.success(`User story "${story.title}" updated!`);
                    options?.onSuccess?.(story);
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
            const errorMsg = err instanceof Error ? err.message : 'Could not update user story. Please try again.';
            console.error('Failed to update user story (exception):', err);
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