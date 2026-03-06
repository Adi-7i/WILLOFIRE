import { apiClient } from './client';
import { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth';

export const authApi = {
    register: async (data: RegisterPayload): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data);
        return response.data;
    },

    login: async (data: LoginPayload): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', data);
        return response.data;
    },
};
