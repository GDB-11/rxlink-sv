// src/lib/api/prescriptionApi.ts

import { api } from './api';

export interface PrescriptionDetailResponse {
    prescriptionDetailCode: string;
    medicationCode: string;
    medicationName: string;
    dose: string;
    administrationRouteCode: string;
    administrationRouteName: string;
    frequencyCode: string;
    frequencyDescription: string;
    durationDays: number;
    instructions: string | null;
}

export interface PrescriptionResponse {
    prescriptionCode: string;
    diagnosticCode: string;
    diagnosticDescription: string;
    patientCode: string;
    statusCode: string;
    statusName: string;
    notes: string | null;
    validUntil: string;
    createdAt: string;
    details: PrescriptionDetailResponse[];
}

export interface PrescriptionLookupItem {
    code: string;
    name: string;
}

export interface MedicationLookupItem {
    code: string;
    name: string;
    defaultDose: string;
    defaultAdministrationRouteCode: string;
}

export interface PrescriptionLookupsResponse {
    prescriptionStatuses: PrescriptionLookupItem[];
    medications: MedicationLookupItem[];
    administrationRoutes: PrescriptionLookupItem[];
    frequencies: PrescriptionLookupItem[];
}

export interface PrescriptionDetailBody {
    MedicationCode: string;
    AdministrationRouteCode: string;
    FrequencyCode: string;
    Dose: string;
    DurationDays: number;
    Instructions?: string | null;
}

export interface CreatePrescriptionBody {
    DiagnosticCode: string;
    Notes?: string | null;
    ValidUntil: string;
    Details: PrescriptionDetailBody[];
}

export interface UpdatePrescriptionBody {
    Notes?: string | null;
    ValidUntil: string;
    Details: PrescriptionDetailBody[];
}

export const prescriptionApi = {
    getPrescription(code: string): Promise<PrescriptionResponse> {
        return api.get<PrescriptionResponse>(`/api/prescription/${code}`);
    },

    createPrescription(body: CreatePrescriptionBody): Promise<PrescriptionResponse> {
        return api.post<PrescriptionResponse>('/api/prescription', body);
    },

    updatePrescription(code: string, body: UpdatePrescriptionBody): Promise<PrescriptionResponse> {
        return api.put<PrescriptionResponse>(`/api/prescription/${code}`, body);
    },

    signPrescription(code: string): Promise<void> {
        return api.patch<void>(`/api/prescription/${code}/sign`, {});
    },

    suspendPrescription(code: string): Promise<void> {
        return api.patch<void>(`/api/prescription/${code}/suspend`, {});
    },

    reactivatePrescription(code: string): Promise<void> {
        return api.patch<void>(`/api/prescription/${code}/reactivate`, {});
    },

    cancelPrescription(code: string): Promise<void> {
        return api.patch<void>(`/api/prescription/${code}/cancel`, {});
    },

    dispensePrescription(code: string): Promise<void> {
        return api.patch<void>(`/api/prescription/${code}/dispense`, {});
    },

    getPrescriptionLookups(): Promise<PrescriptionLookupsResponse> {
        return api.get<PrescriptionLookupsResponse>('/api/lookups/prescriptions');
    }
};
