// src/lib/api/specialtyApi.ts

import { api } from './api';

export interface SpecialtyResponse {
    specialtyCode: string;
    name: string;
    /** Active in the shared catalog. */
    isActive: boolean;
    /** Offered by this partner. */
    isEnabled: boolean;
    priceInPerson: number;
    priceVirtual: number;
}

export interface SpecialtyPageResponse {
    items: SpecialtyResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface PartnerSpecialtyResponse {
    specialtyCode: string;
    isEnabled: boolean;
    priceInPerson: number;
    priceVirtual: number;
}

/** Partial update: omitted fields keep their current value. */
export interface PartnerSpecialtyUpdate {
    isEnabled?: boolean;
    priceInPerson?: number;
    priceVirtual?: number;
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

    updatePartner(code: string, body: PartnerSpecialtyUpdate): Promise<PartnerSpecialtyResponse> {
        return api.patch<PartnerSpecialtyResponse>(`/api/partner/specialties/${code}`, body);
    }
};
