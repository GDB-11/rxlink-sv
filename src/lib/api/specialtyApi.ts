// src/lib/api/specialtyApi.ts

import { api } from './api';

export interface SpecialtyResponse {
    specialtyCode: string;
    name: string;
    isActive: boolean;
}

export interface SpecialtyPageResponse {
    items: SpecialtyResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface SpecialtyRequestBody {
    Name: string;
}

export const specialtyApi = {
    getPage(page: number, pageSize: number, search?: string): Promise<SpecialtyPageResponse> {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize)
        });
        if (search?.trim()) params.set('search', search.trim());
        return api.get<SpecialtyPageResponse>(`/api/specialty?${params}`);
    },

    create(body: SpecialtyRequestBody): Promise<SpecialtyResponse> {
        return api.post<SpecialtyResponse>('/api/specialty', body);
    },

    update(code: string, body: SpecialtyRequestBody): Promise<SpecialtyResponse> {
        return api.put<SpecialtyResponse>(`/api/specialty/${code}`, body);
    },

    deactivate(code: string): Promise<void> {
        return api.patch<void>(`/api/specialty/${code}/deactivate`, {});
    },

    activate(code: string): Promise<void> {
        return api.patch<void>(`/api/specialty/${code}/activate`, {});
    }
};
