import { Result } from '@/domain/types';
import { ApiException } from './exceptions';

export const handleApiCall = async <T>(apiCall: () => Promise<T>): Promise<Result<T>> => {
    try {
        const data = await apiCall();
        return { isSuccess: true, value: data };
    } catch (error) {
        if (error instanceof ApiException) {
            return { 
                isSuccess: false, 
                errors: error.response.errors, 
                traceId: error.response.traceId 
            };
        }
        
        // Handle unexpected errors fallback
        return {
            isSuccess: false,
            errors: [{
                code: 'UNKNOWN_ERROR',
                message: error instanceof Error ? error.message : 'An unexpected error occurred',
                type: 'System'
            }]
        };
    }
};
