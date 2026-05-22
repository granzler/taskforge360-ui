import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { ApiException } from './exceptions';
import { ApiErrorResponse } from '@/domain/types';

/**
 * Normalizes backend error responses that might come in different casings
 * (e.g., PascalCase from .NET vs camelCase from our TypeScript definitions).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeErrorResponse = (data: any): ApiErrorResponse => {
    if (!data) {
        return {
            traceId: 'unknown',
            errors: [{ code: 'UNKNOWN_ERROR', message: 'Unknown error occurred', type: 'System' }]
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = (data.errors || data.Errors || []).map((e: any) => ({
        code: e.code || e.Code || 'UNKNOWN_CODE',
        message: e.message || e.Message || 'An unexpected error occurred',
        type: e.type || e.Type || 'Error'
    }));

    // If no errors found but data has a message (fallback)
    if (errors.length === 0 && (data.message || data.Message)) {
        errors.push({
            code: data.code || data.Code || 'ERROR',
            message: data.message || data.Message,
            type: data.type || data.Type || 'Error'
        });
    }

    return {
        traceId: data.traceId || data.TraceId || 'unknown',
        errors: errors.length > 0 ? errors : [{ code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred', type: 'System' }]
    };
};


const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7157/',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.error('API Error:', error.response?.status, error.response?.data);
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            if (status === 401) {
                console.warn('API returned 401 Unauthorized. Access token may be expired. Signing out...');
                if (typeof window !== 'undefined') {
                    // Import dynamically to avoid SSR parsing issues for toast in global scope if needed
                    import('react-hot-toast').then(({ toast }) => toast.error('Session expired. Please log in again.'));
                    await signOut({ callbackUrl: '/login?session_expired=true' });
                }
            } else if (status === 403) {
                console.warn('API returned 403 Forbidden.');
                if (typeof window !== 'undefined') {
                    import('react-hot-toast').then(({ toast }) => toast.error('You do not have permission to perform this action.'));
                }
                const normalizedError = normalizeErrorResponse(data);
                throw new ApiException(normalizedError);
            } else if ([400, 404, 409].includes(status) && data) {
                // The Result pattern returns a structured error response
                // We normalize it to handle PascalCase/camelCase differences
                const normalizedError = normalizeErrorResponse(data);
                throw new ApiException(normalizedError);
            } else {
                // Handle other errors (500, etc.) with fallback
                throw new ApiException({
                    traceId: data?.TraceId || data?.traceId || 'unknown',
                    errors: [{
                        code: 'HTTP_ERROR',
                        message: `Server returned ${status}: ${data?.Message || data?.message || error.message}`,
                        type: 'System'
                    }]
                });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
