// src/lib/api/authApi.ts

import { api, ApiError } from './api';

interface LoginRequest {
    Username: string;
    Password: string;
}

interface RefreshTokenRequest {
    RefreshToken: string;
}

interface LogoutRequest {
    RefreshToken: string;
}

export interface UserInfo {
    userCode: string;
    username: string;
    fullName: string;
    roleName: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: UserInfo;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const authApi = {
    /**
     * POST /api/auth/login
     * Returns 200 LoginResponse | 401 | 500
     */
    login(username: string, password: string): Promise<LoginResponse> {
        const body: LoginRequest = { Username: username, Password: password };
        return api.post<LoginResponse>('/api/auth/login', body);
    },

    /**
     * POST /api/auth/refresh
     * Returns 200 LoginResponse | 401 | 404 | 500
     */
    refresh(refreshToken: string): Promise<LoginResponse> {
        const body: RefreshTokenRequest = { RefreshToken: refreshToken };
        return api.post<LoginResponse>('/api/auth/refresh', body);
    },

    /**
     * POST /api/auth/logout
     * Returns 204 No Content | 401 | 404 | 500
     */
    logout(refreshToken: string, accessToken: string): Promise<void> {
        const body: LogoutRequest = { RefreshToken: refreshToken };
        return api.post<void>('/api/auth/logout', body, {
            Authorization: `Bearer ${accessToken}`
        });
    }
};

export { ApiError };