// src/lib/api/insuranceApi.ts

import { api } from './api';

export interface InsuranceResponse {
    insuranceCode: string;
    name: string;
    /** Active in the shared catalog. */
    isActive: boolean;
    /** Accepted by this partner. */
    isEnabled: boolean;
    defaultCoveragePercentage: number;
    coveragePercentageOverride: number | null;
    /** In force for this partner: the override when set, otherwise the default. */
    coveragePercentage: number;
}

export interface InsurancePageResponse {
    items: InsuranceResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface PartnerInsuranceResponse {
    insuranceCode: string;
    isEnabled: boolean;
    coveragePercentageOverride: number | null;
}

/** Partial update: omitted fields keep their current value. */
export interface PartnerInsuranceUpdate {
    isEnabled?: boolean;
    coveragePercentageOverride?: number;
    /** Go back to the catalog default. */
    clearCoverageOverride?: boolean;
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

    updatePartner(code: string, body: PartnerInsuranceUpdate): Promise<PartnerInsuranceResponse> {
        return api.patch<PartnerInsuranceResponse>(`/api/partner/insurances/${code}`, body);
    }
};
