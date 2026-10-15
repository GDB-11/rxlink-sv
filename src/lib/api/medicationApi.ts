// src/lib/api/medicationApi.ts

import { api } from './api';

export interface MedicationResponse {
    medicationCode: string;
    pharmaceuticalFormCode: string;
    pharmaceuticalFormName: string;
    administrationRouteCode: string;
    administrationRouteName: string;
    genericName: string;
    commercialName: string | null;
    concentration: string;
    /** Active in the shared catalog. */
    isActive: boolean;
    /** Enabled by this partner. */
    isEnabled: boolean;
    reorderLevel: number | null;
    stockQuantity: number | null;
}

export interface MedicationPageResponse {
    items: MedicationResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface PartnerMedicationResponse {
    medicationCode: string;
    isEnabled: boolean;
    reorderLevel: number | null;
}

/** Partial update: omitted fields keep their current value. */
export interface PartnerMedicationUpdate {
    isEnabled?: boolean;
    reorderLevel?: number;
}

export const medicationApi = {
    getPage(page: number, pageSize: number, search?: string): Promise<MedicationPageResponse> {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize)
        });
        if (search?.trim()) params.set('search', search.trim());
        return api.get<MedicationPageResponse>(`/api/medication?${params}`);
    },

    updatePartner(code: string, body: PartnerMedicationUpdate): Promise<PartnerMedicationResponse> {
        return api.patch<PartnerMedicationResponse>(`/api/partner/medications/${code}`, body);
    }
};
