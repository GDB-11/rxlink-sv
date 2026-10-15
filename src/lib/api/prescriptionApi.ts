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
    frequencyIntervalHours: number;
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

export type StockStatus = 'InStock' | 'Low' | 'Out';

export interface PrescriptionLookupItem {
    code: string;
    name: string;
}

export interface MedicationLookupItem {
    code: string;
    name: string;
    defaultDose: string;
    defaultAdministrationRouteCode: string;
    stockStatus: StockStatus;
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

export interface DoctorDraftPrescriptionResponse {
    prescriptionCode: string;
    patientCode: string;
    patientNames: string;
    patientSurnames: string;
    diagnosticDescription: string;
    createdAt: string;
    detailCount: number;
}

export interface NurseDispensationResponse {
    prescriptionCode: string;
    patientCode: string;
    patientNames: string;
    patientSurnames: string;
    diagnosticDescription: string;
    dispensedAt: string;
    detailCount: number;
    medicationNames: string;
}

export interface DispenseLineBody {
    prescriptionDetailCode: string;
    quantity: number;
}

export type SafetyWarningKind = 'Allergy' | 'Interaction';
export type InteractionSeverity = 'Minor' | 'Moderate' | 'Major' | 'Contraindicated';

export interface PrescriptionSafetyWarning {
    kind:                  SafetyWarningKind;
    /** Allergy: the patient's recorded severity (may be null). Interaction: the rule severity. */
    severity:              string | null;
    ruleCode:              string;
    message:               string;
    medicationCodes:       string[];
    medicationNames:       string[];
    /** Set when the other medication of an interaction is on another, already active prescription. */
    otherPrescriptionCode: string | null;
}

export interface PrescriptionSafetyCheckResponse {
    warnings: PrescriptionSafetyWarning[];
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

    getSafetyCheck(code: string): Promise<PrescriptionSafetyCheckResponse> {
        return api.get<PrescriptionSafetyCheckResponse>(`/api/prescription/${code}/safety-check`);
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

    /** `overrideReason` dispenses beyond the clinic's balance and records the shortfall. */
    dispensePrescription(code: string, items: DispenseLineBody[], overrideReason?: string): Promise<void> {
        return api.patch<void>(`/api/prescription/${code}/dispense`, { items, overrideReason });
    },

    getPrescriptionLookups(): Promise<PrescriptionLookupsResponse> {
        return api.get<PrescriptionLookupsResponse>('/api/lookups/prescriptions');
    },

    getDoctorDraftPrescriptions(): Promise<DoctorDraftPrescriptionResponse[]> {
        return api.get<DoctorDraftPrescriptionResponse[]>('/api/doctor/prescriptions/drafts');
    },

    getNurseDispensations(date?: string): Promise<NurseDispensationResponse[]> {
        const qs = date ? `?date=${date}` : '';
        return api.get<NurseDispensationResponse[]>(`/api/nurse/dispensations${qs}`);
    }
};
