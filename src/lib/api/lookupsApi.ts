// src/lib/api/lookupsApi.ts

import { api } from './api';

export interface GuidLookupItemResponse {
    code: string;
    name: string;
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

export interface InsuranceLookupItemResponse {
    code: string;
    name: string;
    coveragePercentage: number;
}

export interface SpecialtyPricingLookupItemResponse {
    code: string;
    priceInPerson: number;
    priceVirtual: number;
}

export interface AppointmentLookupsResponse {
    consultationTypes: GuidLookupItemResponse[];
    insurances: InsuranceLookupItemResponse[];
    specialties: SpecialtyPricingLookupItemResponse[];
}

export const lookupsApi = {
    getUserLookups(): Promise<UserLookupsResponse> {
        return api.get<UserLookupsResponse>('/api/lookups/users');
    },

    getPatientLookups(): Promise<PatientLookupsResponse> {
        return api.get<PatientLookupsResponse>('/api/lookups/patients');
    },

    getAppointmentLookups(): Promise<AppointmentLookupsResponse> {
        return api.get<AppointmentLookupsResponse>('/api/lookups/appointments');
    }
};
