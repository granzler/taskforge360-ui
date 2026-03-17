import { Result } from '@/domain/types';
import { ApiException } from './exceptions';

export const handleApiCall = async <T>(apiCall: () => Promise<T>): Promise<Result<T>> => {
    try {
        const data = await apiCall();
        return { success: true, data };
    } catch (error) {
        if (error instanceof ApiException) {
            return {
                success: false,
                errors: error.response.errors,
                traceId: error.response.traceId
            };
        }
        
        // Handle unexpected errors fallback
        return {
            success: false,
            errors: [{
                code: 'UNKNOWN_ERROR',
                message: error instanceof Error ? error.message : 'An unexpected error occurred',
                type: 'System'
            }]
        };
    }
};
