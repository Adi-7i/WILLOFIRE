import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/lib/utils/token';
import { AuthResponse } from '@/types/auth';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let refreshPromise: Promise<string | null> | null = null;

const normalizeErrorMessage = (error: AxiosError) => {
    const responseData = error.response?.data as { message?: string | string[] } | undefined;
    if (!responseData?.message) return;

    error.message = Array.isArray(responseData.message)
        ? responseData.message.join(', ')
        : responseData.message;
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                clearTokens();
                normalizeErrorMessage(error);
                return Promise.reject(error);
            }

            if (!refreshPromise) {
                refreshPromise = axios
                    .post<AuthResponse>(`${baseURL}/api/v1/auth/refresh`, { refreshToken }, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                    .then((response) => {
                        const data = response.data;
                        setTokens(data.accessToken, data.refreshToken);
                        return data.accessToken;
                    })
                    .catch(() => {
                        clearTokens();
                        return null;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const newAccessToken = await refreshPromise;
            if (newAccessToken) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            }
        }

        normalizeErrorMessage(error);
        return Promise.reject(error);
    }
);
