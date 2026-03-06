import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { setToken } from '@/lib/utils/token';
import { LoginPayload, RegisterPayload } from '@/types/auth';

export const useLogin = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (data: LoginPayload) => authApi.login(data),
        onSuccess: (data) => {
            setToken(data.accessToken);
            router.push('/dashboard');
        },
    });
};

export const useRegister = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (data: RegisterPayload) => authApi.register(data),
        onSuccess: (data) => {
            setToken(data.accessToken);
            router.push('/dashboard');
        },
    });
};
