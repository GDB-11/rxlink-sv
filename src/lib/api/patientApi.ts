// src/lib/api/patientApi.ts

import { api } from './api';

export interface PatientAllergyResponse {
    patientAllergyCode: string;
    allergyCode: string;
    allergyName: string;
    severityCode: string | null;
    severityName: string | null;
    notes: string | null;
}

export interface PatientResponse {
    patientCode: string;
    personCode: string;
    medicalRecordNumber: string;
    isActive: boolean;
    // Person (read-only — managed via /personas)
    names: string;
    surnames: string;
    birthDate: string;
    phone: string;
    alternativePhone: string | null;
    email: string;
    address: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    allergies: PatientAllergyResponse[];
}

export interface PatientPageResponse {
    items: PatientResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreatePatientAllergyItem {
    AllergyCode: string;
    SeverityCode: string;
    Notes?: string | null;
}

export interface CreatePatientBody {
    PersonCode: string;
    Allergies?: CreatePatientAllergyItem[];
}

export interface UpdatePatientBody {
    MedicalRecordNumber: string;
}

export interface PatientAllergyBody {
    AllergyCode: string;
    SeverityCode: string;
    Notes?: string | null;
}

export const patientApi = {
    getByCode(code: string): Promise<PatientResponse> {
        return api.get<PatientResponse>(`/api/patient/${code}`);
    },

    getByPersonCode(personCode: string): Promise<PatientResponse> {
        return api.get<PatientResponse>(`/api/patient/by-person/${personCode}`);
    },

    getPage(page: number, pageSize: number, search?: string): Promise<PatientPageResponse> {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize)
        });
        if (search?.trim()) params.set('search', search.trim());
        return api.get<PatientPageResponse>(`/api/patient?${params}`);
    },

    create(body: CreatePatientBody): Promise<PatientResponse> {
        return api.post<PatientResponse>('/api/patient', body);
    },

    update(code: string, body: UpdatePatientBody): Promise<PatientResponse> {
        return api.put<PatientResponse>(`/api/patient/${code}`, body);
    },

    deactivate(code: string): Promise<void> {
        return api.patch<void>(`/api/patient/${code}/deactivate`, {});
    },

    activate(code: string): Promise<void> {
        return api.patch<void>(`/api/patient/${code}/activate`, {});
    },

    addAllergy(patientCode: string, body: PatientAllergyBody): Promise<PatientAllergyResponse> {
        return api.post<PatientAllergyResponse>(`/api/patient/${patientCode}/allergies`, body);
    },

    updateAllergy(patientCode: string, allergyCode: string, body: PatientAllergyBody): Promise<PatientAllergyResponse> {
        return api.put<PatientAllergyResponse>(`/api/patient/${patientCode}/allergies/${allergyCode}`, body);
    },

    removeAllergy(patientCode: string, allergyCode: string): Promise<void> {
        return api.delete<void>(`/api/patient/${patientCode}/allergies/${allergyCode}`);
    }
};
