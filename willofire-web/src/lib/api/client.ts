import axios from 'axios';
import { getToken } from '@/lib/utils/token';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Standardize error format if possible
        if (error.response?.data?.message) {
            error.message = Array.isArray(error.response.data.message)
                ? error.response.data.message.join(', ')
                : error.response.data.message;
        }
        return Promise.reject(error);
    }
);
