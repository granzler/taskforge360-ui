'use client';

import { useState } from 'react';
import { CreateUserStoryRequestDto, UserStoryDto } from '@/domain/entities/UserStory';
import { userStoryService } from '@/infrastructure/services/userStoryService';
import { toast } from 'react-hot-toast';
import { notifyResult } from '@/lib/utils/notify';

interface UseCreateUserStoryOptions {
    onSuccess?: (story: UserStoryDto) => void;
    onError?: (error: string) => void;
}

export function useCreateUserStory(options?: UseCreateUserStoryOptions) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = async (data: CreateUserStoryRequestDto): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await userStoryService.create(data);
            if (notifyResult(result, {
                onSuccess: (story) => {
                    toast.success(`User story "${story.title}" created!`);
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
            const errorMsg = err instanceof Error ? err.message : 'Could not create user story. Please try again.';
            console.error('Failed to create user story (exception):', err);
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