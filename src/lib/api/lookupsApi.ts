// src/lib/api/lookupsApi.ts

import { api } from './api';

export interface LookupItemResponse {
    id: number;
    name: string;
}

export interface GuidLookupItemResponse {
    code: string;
    name: string;
}

export interface MedicationLookupsResponse {
    pharmaceuticalForms: LookupItemResponse[];
    administrationRoutes: LookupItemResponse[];
}

export interface UserLookupsResponse {
    sexes: GuidLookupItemResponse[];
    documentTypes: GuidLookupItemResponse[];
    roles: GuidLookupItemResponse[];
    specialties: GuidLookupItemResponse[];
}

export interface PatientLookupsResponse {
    allergySeverities: GuidLookupItemResponse[];
}

export const lookupsApi = {
    getMedicationLookups(): Promise<MedicationLookupsResponse> {
        return api.get<MedicationLookupsResponse>('/api/lookups/medications');
    },

    getUserLookups(): Promise<UserLookupsResponse> {
        return api.get<UserLookupsResponse>('/api/lookups/users');
    },

    getPatientLookups(): Promise<PatientLookupsResponse> {
        return api.get<PatientLookupsResponse>('/api/lookups/patients');
    }
};
