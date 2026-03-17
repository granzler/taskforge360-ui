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
        if (error.response) {
            const status = error.response.status;
            
            if (status === 401) {
                console.warn('API returned 401 Unauthorized. Access token may be expired. Signing out...');
                if (typeof window !== 'undefined') {
                    // Import dynamically to avoid SSR parsing issues for toast in global scope if needed
                    import('react-hot-toast').then(({ toast }) => toast.error('Session expired. Please log in again.'));
                    await signOut({ callbackUrl: '/login?session_expired=true' });
                }
            } else if ([400, 404, 409].includes(status) && error.response.data && error.response.data.errors) {
                // The Result pattern returns a structured error response
                throw new ApiException(error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
