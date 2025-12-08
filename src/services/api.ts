import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7157/', // Base URL as requested
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
