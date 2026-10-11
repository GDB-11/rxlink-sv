// src/lib/api/breakGlassApi.ts

import { api } from './api';

export interface BreakGlassResponse {
    patientCode: string;
    /** Null when the patient was already in the nurse's care team and no grant was needed. */
    expiresAt: string | null;
}

export const breakGlassApi = {
    /**
     * POST /api/nurse/break-glass — Enfermero only.
     * 200 | 400 reason too short | 404 no active patient with that record number.
     */
    request(medicalRecordNumber: string, reason: string): Promise<BreakGlassResponse> {
        return api.post<BreakGlassResponse>('/api/nurse/break-glass', {
            MedicalRecordNumber: medicalRecordNumber,
            Reason: reason
        });
    }
};
