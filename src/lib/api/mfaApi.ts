// src/lib/api/mfaApi.ts

import { api } from './api';

export interface MfaStatus {
    enabled: boolean;
    pending: boolean;
}

export interface MfaEnrollment {
    secret: string;
    otpauthUri: string;
}

export const mfaApi = {
    /** GET /api/mfa/status */
    getStatus(): Promise<MfaStatus> {
        return api.get<MfaStatus>('/api/mfa/status');
    },

    /** POST /api/mfa/enroll — 200 | 409 when MFA is already enabled */
    enroll(): Promise<MfaEnrollment> {
        return api.post<MfaEnrollment>('/api/mfa/enroll', {});
    },

    /** POST /api/mfa/confirm — 204 | 400 wrong code or nothing pending */
    confirm(code: string): Promise<void> {
        return api.post<void>('/api/mfa/confirm', { Code: code });
    },

    /** DELETE /api/mfa/users/{userCode} — Administrador only, 204 | 404 when the user has no MFA */
    resetForUser(userCode: string): Promise<void> {
        return api.delete<void>(`/api/mfa/users/${userCode}`);
    }
};
