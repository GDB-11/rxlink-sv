// src/lib/api/profileApi.ts

import { api } from './api';
import type { UserResponse } from './userApi';

export type { UserResponse };

export interface ChangePasswordBody {
    CurrentPassword: string;
    NewPassword: string;
}

export const profileApi = {
    /**
     * GET /api/profile
     * Returns the full profile of the currently authenticated user.
     */
    getMyProfile(): Promise<UserResponse> {
        return api.get<UserResponse>('/api/profile');
    },

    /**
     * PATCH /api/profile/password
     * Changes the authenticated user's password.
     * Returns 204 No Content on success.
     */
    changePassword(body: ChangePasswordBody): Promise<void> {
        return api.patch<void>('/api/profile/password', body);
    }
};
