// src/lib/features/medical-profile/stores/medicalProfile.svelte.ts

import { patientApi, type PatientResponse, type PatientAllergyBody } from '$lib/api/patientApi';
import {
    diagnosticApi,
    type DiagnosticResponse,
    type CreateDiagnosticBody,
    type UpdateDiagnosticBody
} from '$lib/api/diagnosticApi';
import {
    prescriptionApi,
    type PrescriptionResponse,
    type CreatePrescriptionBody,
    type UpdatePrescriptionBody
} from '$lib/api/prescriptionApi';

let _patient     = $state<PatientResponse | null>(null);
let _diagnostics = $state<DiagnosticResponse[]>([]);
let _page        = $state(1);
let _pageSize    = $state(10);
let _totalPages  = $state(0);
let _totalCount  = $state(0);
let _loading     = $state(false);
let _error       = $state<string | null>(null);
let _submitting  = $state(false);
let _submitError = $state<string | null>(null);

let _patientCode = '';

async function _loadDiagnostics(): Promise<void> {
    const data = await diagnosticApi.getDiagnostics(_patientCode, _page, _pageSize);
    _diagnostics = data.items;
    _totalCount  = data.totalCount;
    _totalPages  = data.totalPages;
}

function _applyPrescription(resp: PrescriptionResponse): void {
    const idx = _diagnostics.findIndex(d => d.diagnosticCode === resp.diagnosticCode);
    if (idx !== -1) {
        _diagnostics[idx] = {
            ..._diagnostics[idx],
            prescription: {
                prescriptionCode: resp.prescriptionCode,
                statusCode:       resp.statusCode,
                statusName:       resp.statusName,
                validUntil:       resp.validUntil,
                detailCount:      resp.details.length
            }
        };
    }
}

export const medicalProfile = {
    get patient()     { return _patient; },
    get diagnostics() { return _diagnostics; },
    get page()        { return _page; },
    get pageSize()    { return _pageSize; },
    get totalPages()  { return _totalPages; },
    get totalCount()  { return _totalCount; },
    get loading()     { return _loading; },
    get error()       { return _error; },
    get submitting()  { return _submitting; },
    get submitError() { return _submitError; },

    async load(patientCode: string): Promise<void> {
        _patientCode = patientCode;
        _page        = 1;
        _loading     = true;
        _error       = null;
        try {
            const [patient] = await Promise.all([
                patientApi.getByCode(patientCode),
                _loadDiagnostics()
            ]);
            _patient = patient;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar el perfil médico.';
        } finally {
            _loading = false;
        }
    },

    async setPage(p: number): Promise<void> {
        _page    = p;
        _loading = true;
        _error   = null;
        try {
            await _loadDiagnostics();
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar los diagnósticos.';
        } finally {
            _loading = false;
        }
    },

    async addAllergy(body: PatientAllergyBody): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            const allergy = await patientApi.addAllergy(_patientCode, body);
            if (_patient) {
                _patient = { ..._patient, allergies: [..._patient.allergies, allergy] };
            }
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al agregar la alergia.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async updateAllergy(allergyCode: string, body: PatientAllergyBody): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            const updated = await patientApi.updateAllergy(_patientCode, allergyCode, body);
            if (_patient) {
                _patient = {
                    ..._patient,
                    allergies: _patient.allergies.map(a =>
                        a.patientAllergyCode === allergyCode ? updated : a
                    )
                };
            }
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al actualizar la alergia.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async removeAllergy(allergyCode: string): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await patientApi.removeAllergy(_patientCode, allergyCode);
            if (_patient) {
                _patient = {
                    ..._patient,
                    allergies: _patient.allergies.filter(a => a.patientAllergyCode !== allergyCode)
                };
            }
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al eliminar la alergia.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async addDiagnostic(body: CreateDiagnosticBody): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await diagnosticApi.createDiagnostic(body);
            _page = 1;
            await _loadDiagnostics();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al crear el diagnóstico.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async updateDiagnostic(code: string, body: UpdateDiagnosticBody): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            const updated = await diagnosticApi.updateDiagnostic(code, body);
            _diagnostics = _diagnostics.map(d => d.diagnosticCode === code ? updated : d);
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al actualizar el diagnóstico.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async deactivateDiagnostic(code: string): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await diagnosticApi.deactivateDiagnostic(code);
            await _loadDiagnostics();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al desactivar el diagnóstico.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async activateDiagnostic(code: string): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await diagnosticApi.activateDiagnostic(code);
            await _loadDiagnostics();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al activar el diagnóstico.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async addPrescription(body: CreatePrescriptionBody): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            const resp = await prescriptionApi.createPrescription(body);
            _applyPrescription(resp);
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al crear la receta.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async updatePrescription(code: string, body: UpdatePrescriptionBody): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            const resp = await prescriptionApi.updatePrescription(code, body);
            _applyPrescription(resp);
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al actualizar la receta.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async signPrescription(code: string): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await prescriptionApi.signPrescription(code);
            const resp = await prescriptionApi.getPrescription(code);
            _applyPrescription(resp);
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al firmar la receta.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async suspendPrescription(code: string): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await prescriptionApi.suspendPrescription(code);
            const resp = await prescriptionApi.getPrescription(code);
            _applyPrescription(resp);
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al suspender la receta.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async reactivatePrescription(code: string): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await prescriptionApi.reactivatePrescription(code);
            const resp = await prescriptionApi.getPrescription(code);
            _applyPrescription(resp);
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al reactivar la receta.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async cancelPrescription(code: string): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await prescriptionApi.cancelPrescription(code);
            const resp = await prescriptionApi.getPrescription(code);
            _applyPrescription(resp);
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al cancelar la receta.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async dispensePrescription(code: string): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await prescriptionApi.dispensePrescription(code);
            const resp = await prescriptionApi.getPrescription(code);
            _applyPrescription(resp);
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al dispensar la receta.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    clearSubmitError(): void {
        _submitError = null;
    }
};
