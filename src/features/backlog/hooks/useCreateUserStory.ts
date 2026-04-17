'use client';

import { useState } from 'react';
import { CreateUserStoryRequestDto, UserStoryDto } from '@/domain/entities/UserStory';
import { userStoryService } from '@/infrastructure/services/userStoryService';
import { toast } from 'react-hot-toast';

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
            if (result.success) {
                toast.success(`User story "${result.data.title}" created!`);
                options?.onSuccess?.(result.data);
                return true;
            } else {
                const errorMsg = result.errors.map(e => e.message).join(', ') || 'Could not create user story.';
                setError(errorMsg);
                toast.error(errorMsg);
                options?.onError?.(errorMsg);
                return false;
            }
        } catch (err) {
            const errorMsg = 'Could not create user story. Please try again.';
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