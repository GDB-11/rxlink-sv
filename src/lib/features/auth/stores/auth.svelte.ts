// src/lib/features/auth/stores/auth.svelte.ts

import { browser } from '$app/environment';
import type { LoginResponse, UserInfo } from '$lib/api/authApi';
import { LAST_ACTIVITY_KEY } from '../sessionPolicy';

export type { LoginResponse, UserInfo };

const STORAGE_KEY = 'rxlink_auth';

let _user = $state<UserInfo | null>(null);
let _accessToken = $state<string | null>(null);
let _refreshToken = $state<string | null>(null);
let _sessionStartedAt = $state<number | null>(null);

function hydrate() {
    if (!browser) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
        const parsed = JSON.parse(stored) as {
            user: UserInfo;
            accessToken: string;
            refreshToken: string;
            sessionStartedAt?: number;
        };
        _user = parsed.user;
        _accessToken = parsed.accessToken;
        _refreshToken = parsed.refreshToken;
        // Sessions stored before the absolute limit existed: start counting from now.
        _sessionStartedAt = parsed.sessionStartedAt ?? Date.now();
    } catch {
        localStorage.removeItem(STORAGE_KEY);
    }
}

hydrate();

function store(data: LoginResponse) {
    _user = data.user;
    _accessToken = data.accessToken;
    _refreshToken = data.refreshToken;
    if (browser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            sessionStartedAt: _sessionStartedAt
        }));
    }
}

export const auth = {
    get user(): UserInfo | null { return _user; },
    get accessToken(): string | null { return _accessToken; },
    get isAuthenticated(): boolean { return _user !== null && _accessToken !== null; },
    get roleName(): string | null { return _user?.roleName ?? null; },
    /** Epoch ms of the login that started this session (survives token refreshes). */
    get sessionStartedAt(): number | null { return _sessionStartedAt; },
    getRefreshToken(): string | null { return _refreshToken; },

    /** A new login: starts a new session and resets the idle clock. */
    login(data: LoginResponse) {
        _sessionStartedAt = Date.now();
        if (browser) localStorage.setItem(LAST_ACTIVITY_KEY, String(_sessionStartedAt));
        store(data);
    },

    /** Token refresh: new tokens, same session (the absolute limit keeps counting). */
    updateTokens(data: LoginResponse) {
        _sessionStartedAt ??= Date.now();
        store(data);
    },

    logout() {
        _user = null;
        _accessToken = null;
        _refreshToken = null;
        _sessionStartedAt = null;
        if (browser) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(LAST_ACTIVITY_KEY);
        }
    }
};