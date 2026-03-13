import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

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
        if (error.response && error.response.status === 401) {
            console.warn('API returned 401 Unauthorized. Access token may be expired. Signing out...');
            if (typeof window !== 'undefined') {
                await signOut({ callbackUrl: '/login?session_expired=true' });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
