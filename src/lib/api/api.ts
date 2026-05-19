// src/lib/api/api.ts

import { PUBLIC_API_BASE_URL } from '$env/static/public';

async function request<T>(
    path: string,
    init: RequestInit = {}
): Promise<T> {
    const url = `${PUBLIC_API_BASE_URL}${path}`;

    const response = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init.headers
        }
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { message?: string };
        const message = body.message ?? response.statusText;
        throw new ApiError(response.status, message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const api = {
    get<T>(path: string, headers?: HeadersInit): Promise<T> {
        return request<T>(path, { method: 'GET', headers });
    },

    post<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> {
        return request<T>(path, {
            method: 'POST',
            body: JSON.stringify(body),
            headers
        });
    },

    put<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> {
        return request<T>(path, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers
        });
    },

    patch<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> {
        return request<T>(path, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers
        });
    },

    delete<T>(path: string, body?: unknown, headers?: HeadersInit): Promise<T> {
        return request<T>(path, {
            method: 'DELETE',
            body: body !== undefined ? JSON.stringify(body) : undefined,
            headers
        });
    }
};