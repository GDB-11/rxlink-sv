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

/** 202 from login: password accepted, a second factor is required to finish. */
export interface MfaChallenge {
    mfaRequired: true;
    mfaToken: string;
    expiresAt: string;
}

export function isMfaChallenge(data: LoginResponse | MfaChallenge): data is MfaChallenge {
    return 'mfaRequired' in data && data.mfaRequired === true;
}

interface MfaVerifyRequest {
    MfaToken: string;
    Code: string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const authApi = {
    /**
     * POST /api/auth/login
     * Returns 200 LoginResponse | 202 MfaChallenge (account has MFA) | 401 | 500
     */
    login(username: string, password: string): Promise<LoginResponse | MfaChallenge> {
        const body: LoginRequest = { Username: username, Password: password };
        return api.post<LoginResponse | MfaChallenge>('/api/auth/login', body);
    },

    /**
     * POST /api/auth/mfa/verify
     * Completes an MFA login. Returns 200 LoginResponse | 401 | 500
     */
    verifyMfa(mfaToken: string, code: string): Promise<LoginResponse> {
        const body: MfaVerifyRequest = { MfaToken: mfaToken, Code: code };
        return api.post<LoginResponse>('/api/auth/mfa/verify', body);
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