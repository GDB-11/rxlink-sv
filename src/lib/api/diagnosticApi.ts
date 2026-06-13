// src/lib/api/diagnosticApi.ts

import { api } from './api';

export interface PrescriptionSummaryResponse {
    prescriptionCode: string;
    statusCode: string;
    statusName: string;
    validUntil: string;
    detailCount: number;
}

export interface DiagnosticResponse {
    diagnosticCode: string;
    appointmentCode: string;
    patientCode: string;
    statusCode: string;
    statusName: string;
    description: string;
    diagnosedAt: string;
    notes: string | null;
    createdAt: string;
    prescription: PrescriptionSummaryResponse | null;
}

export interface DiagnosticPageResponse {
    items: DiagnosticResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateDiagnosticBody {
    AppointmentCode: string;
    Description: string;
    DiagnosedAt: string;
    Notes?: string | null;
}

export interface UpdateDiagnosticBody {
    Description: string;
    DiagnosedAt: string;
    Notes?: string | null;
}

export const diagnosticApi = {
    getDiagnostics(patientCode: string, page: number, pageSize: number): Promise<DiagnosticPageResponse> {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        return api.get<DiagnosticPageResponse>(`/api/patient/${patientCode}/diagnostics?${params}`);
    },

    createDiagnostic(body: CreateDiagnosticBody): Promise<DiagnosticResponse> {
        return api.post<DiagnosticResponse>('/api/diagnostic', body);
    },

    updateDiagnostic(code: string, body: UpdateDiagnosticBody): Promise<DiagnosticResponse> {
        return api.put<DiagnosticResponse>(`/api/diagnostic/${code}`, body);
    },

    deactivateDiagnostic(code: string): Promise<void> {
        return api.patch<void>(`/api/diagnostic/${code}/deactivate`, {});
    },

    activateDiagnostic(code: string): Promise<void> {
        return api.patch<void>(`/api/diagnostic/${code}/activate`, {});
    }
};
