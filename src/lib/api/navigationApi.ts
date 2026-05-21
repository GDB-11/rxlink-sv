// src/lib/api/navigationApi.ts

import { api } from './api';
import { auth } from '$lib/features/auth';

export interface NavigationItem {
    itemCode: string;
    label: string;
    icon: string;
    path: string;
    order: number;
}

export interface NavigationModule {
    moduleCode: string;
    label: string;
    icon: string;
    order: number;
    items: NavigationItem[];
}

export interface NavigationResponse {
    modules: NavigationModule[];
}

export const navigationApi = {
    /**
     * GET /api/navigation
     * Returns navigation tree filtered by the authenticated user's role.
     */
    getNavigation(): Promise<NavigationResponse> {
        const token = auth.accessToken;
        return api.get<NavigationResponse>('/api/navigation', {
            Authorization: `Bearer ${token}`
        });
    }
};
