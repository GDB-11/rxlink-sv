// src/lib/api/lookupsApi.ts

import { api } from './api';

export interface LookupItemResponse {
    id: number;
    name: string;
}

export interface MedicationLookupsResponse {
    pharmaceuticalForms:  LookupItemResponse[];
    administrationRoutes: LookupItemResponse[];
}

export const lookupsApi = {
    getMedicationLookups(): Promise<MedicationLookupsResponse> {
        return api.get<MedicationLookupsResponse>('/api/lookups/medications');
    }
};
