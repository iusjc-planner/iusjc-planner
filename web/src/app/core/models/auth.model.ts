export interface LoginRequest {
    login: string;
    password: string;
}

export interface LoginResponse {
    token?: string;
    accessToken?: string;
    jwt?: string;
    role?: string;
    roles?: string[];
    username?: string;
}

export interface SessionUser {
    token: string;
    role: string;
    username: string;
    exp?: number;
}
