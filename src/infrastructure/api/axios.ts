import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { ApiException } from './exceptions';

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
            } else if ([400, 404, 409].includes(status) && data && data.errors) {
                // The Result pattern returns a structured error response
                throw new ApiException(data);
            } else {
                // Handle other errors (500, etc.) with fallback
                throw new ApiException({
                    traceId: 'unknown',
                    errors: [{
                        code: 'HTTP_ERROR',
                        message: `Server returned ${status}: ${data?.message || error.message}`,
                        type: 'System'
                    }]
                });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
