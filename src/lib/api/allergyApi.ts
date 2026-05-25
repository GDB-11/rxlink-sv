// src/lib/api/allergyApi.ts

import { api } from './api';

export interface AllergyResponse {
    allergyCode: string;
    name: string;
    description: string | null;
    isActive: boolean;
}

export interface AllergyPageResponse {
    items: AllergyResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface AllergyRequestBody {
    Name: string;
    Description?: string | null;
}

export const allergyApi = {
    getPage(page: number, pageSize: number, search?: string): Promise<AllergyPageResponse> {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize)
        });
        if (search?.trim()) params.set('search', search.trim());
        return api.get<AllergyPageResponse>(`/api/allergy?${params}`);
    },

    create(body: AllergyRequestBody): Promise<AllergyResponse> {
        return api.post<AllergyResponse>('/api/allergy', body);
    },

    update(code: string, body: AllergyRequestBody): Promise<AllergyResponse> {
        return api.put<AllergyResponse>(`/api/allergy/${code}`, body);
    },

    deactivate(code: string): Promise<void> {
        return api.patch<void>(`/api/allergy/${code}/deactivate`, {});
    },

    activate(code: string): Promise<void> {
        return api.patch<void>(`/api/allergy/${code}/activate`, {});
    }
};
