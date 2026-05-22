// src/lib/api/medicationsApi.ts

import { api } from './api';

export interface MedicationResponse {
    medicationCode: string;
    pharmaceuticalFormId: number;
    pharmaceuticalFormName: string;
    administrationRouteId: number;
    administrationRouteName: string;
    genericName: string;
    commercialName: string | null;
    concentration: string;
    isActive: boolean;
}

export interface MedicationPageResponse {
    items: MedicationResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface MedicationRequestBody {
    PharmaceuticalFormId: number;
    AdministrationRouteId: number;
    GenericName: string;
    CommercialName?: string | null;
    Concentration: string;
}

export const medicationsApi = {
    getPage(page: number, pageSize: number, search?: string): Promise<MedicationPageResponse> {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize)
        });
        if (search?.trim()) params.set('search', search.trim());
        return api.get<MedicationPageResponse>(`/api/medications?${params}`);
    },

    create(body: MedicationRequestBody): Promise<MedicationResponse> {
        return api.post<MedicationResponse>('/api/medications', body);
    },

    update(code: string, body: MedicationRequestBody): Promise<MedicationResponse> {
        return api.put<MedicationResponse>(`/api/medications/${code}`, body);
    },

    deactivate(code: string): Promise<void> {
        return api.patch<void>(`/api/medications/${code}/deactivate`, {});
    }
};
