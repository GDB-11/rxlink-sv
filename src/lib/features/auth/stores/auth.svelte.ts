// src/lib/features/auth/stores/auth.svelte.ts

import { browser } from '$app/environment';
import type { LoginResponse, UserInfo } from '$lib/api/authApi';

export type { LoginResponse, UserInfo };

const STORAGE_KEY = 'rxlink_auth';

let _user = $state<UserInfo | null>(null);
let _accessToken = $state<string | null>(null);
let _refreshToken = $state<string | null>(null);

function hydrate() {
    if (!browser) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
        const parsed = JSON.parse(stored) as {
            user: UserInfo;
            accessToken: string;
            refreshToken: string;
        };
        _user = parsed.user;
        _accessToken = parsed.accessToken;
        _refreshToken = parsed.refreshToken;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
    }
}

hydrate();

export const auth = {
    get user(): UserInfo | null { return _user; },
    get accessToken(): string | null { return _accessToken; },
    get isAuthenticated(): boolean { return _user !== null && _accessToken !== null; },
    getRefreshToken(): string | null { return _refreshToken; },

    login(data: LoginResponse) {
        _user = data.user;
        _accessToken = data.accessToken;
        _refreshToken = data.refreshToken;
        if (browser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                user: data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            }));
        }
    },

    logout() {
        _user = null;
        _accessToken = null;
        _refreshToken = null;
        if (browser) localStorage.removeItem(STORAGE_KEY);
    }
};