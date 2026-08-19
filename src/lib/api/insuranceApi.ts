// src/lib/api/insuranceApi.ts

import { api } from './api';

export interface InsuranceResponse {
    insuranceCode: string;
    name: string;
    coveragePercentage: number;
    isActive: boolean;
}

export interface InsurancePageResponse {
    items: InsuranceResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface InsuranceRequestBody {
    Name: string;
    CoveragePercentage: number;
}

export const insuranceApi = {
    getPage(page: number, pageSize: number, search?: string): Promise<InsurancePageResponse> {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize)
        });
        if (search?.trim()) params.set('search', search.trim());
        return api.get<InsurancePageResponse>(`/api/insurance?${params}`);
    },

    create(body: InsuranceRequestBody): Promise<InsuranceResponse> {
        return api.post<InsuranceResponse>('/api/insurance', body);
    },

    update(code: string, body: InsuranceRequestBody): Promise<InsuranceResponse> {
        return api.put<InsuranceResponse>(`/api/insurance/${code}`, body);
    },

    deactivate(code: string): Promise<void> {
        return api.patch<void>(`/api/insurance/${code}/deactivate`, {});
    },

    activate(code: string): Promise<void> {
        return api.patch<void>(`/api/insurance/${code}/activate`, {});
    }
};
