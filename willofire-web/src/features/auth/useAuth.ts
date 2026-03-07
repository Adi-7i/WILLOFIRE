import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { clearTokens, setTokens } from '@/lib/utils/token';
import { LoginPayload, RegisterPayload } from '@/types/auth';

export const useLogin = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (data: LoginPayload) => authApi.login(data),
        onSuccess: (data) => {
            setTokens(data.accessToken, data.refreshToken);
            router.push('/dashboard');
        },
    });
};

export const useRegister = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (data: RegisterPayload) => authApi.register(data),
        onSuccess: (data) => {
            setTokens(data.accessToken, data.refreshToken);
            router.push('/dashboard');
        },
    });
};

export const useLogout = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: authApi.logout,
        onSettled: () => {
            clearTokens();
            router.push('/login');
        },
    });
};
