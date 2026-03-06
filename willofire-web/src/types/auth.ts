export interface UserDetails {
    id: string;
    email: string;
}

export interface AuthResponse {
    accessToken: string;
    user?: UserDetails;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
}
