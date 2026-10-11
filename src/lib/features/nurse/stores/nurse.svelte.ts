// src/lib/features/nurse/stores/nurse.svelte.ts

import { patientApi, type PatientResponse } from '$lib/api/patientApi';
import { breakGlassApi } from '$lib/api/breakGlassApi';

let _results    = $state<PatientResponse[]>([]);
let _search     = $state('');
let _page       = $state(1);
let _pageSize   = $state(20);
let _totalPages = $state(0);
let _totalCount = $state(0);
let _loading    = $state(false);
let _error      = $state<string | null>(null);

let _breakGlassSubmitting = $state(false);
let _breakGlassError      = $state<string | null>(null);

export const nurse = {
    get results():    PatientResponse[] { return _results; },
    get search():     string            { return _search; },
    get page():       number            { return _page; },
    get pageSize():   number            { return _pageSize; },
    get totalPages(): number            { return _totalPages; },
    get totalCount(): number            { return _totalCount; },
    get loading():    boolean           { return _loading; },
    get error():      string | null     { return _error; },
    get breakGlassSubmitting(): boolean { return _breakGlassSubmitting; },
    get breakGlassError(): string | null { return _breakGlassError; },

    async searchPatients(query: string): Promise<void> {
        _search = query;
        _page   = 1;

        if (!query.trim()) {
            _results    = [];
            _totalCount = 0;
            _totalPages = 0;
            return;
        }

        _loading = true;
        _error   = null;
        try {
            const data  = await patientApi.getPage(1, _pageSize, query);
            _results    = data.items;
            _totalCount = data.totalCount;
            _totalPages = data.totalPages;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al buscar pacientes.';
        } finally {
            _loading = false;
        }
    },

    async setPage(p: number): Promise<void> {
        _page    = p;
        _loading = true;
        _error   = null;
        try {
            const data  = await patientApi.getPage(p, _pageSize, _search);
            _results    = data.items;
            _totalCount = data.totalCount;
            _totalPages = data.totalPages;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar pacientes.';
        } finally {
            _loading = false;
        }
    },

    /**
     * Opens a patient outside the nurse's care team. Returns the patient code to navigate to,
     * or null when the request failed (the reason is in `breakGlassError`).
     */
    async requestBreakGlass(medicalRecordNumber: string, reason: string): Promise<string | null> {
        _breakGlassSubmitting = true;
        _breakGlassError      = null;
        try {
            const res = await breakGlassApi.request(medicalRecordNumber, reason);
            return res.patientCode;
        } catch (err) {
            _breakGlassError = err instanceof Error ? err.message : 'No se pudo registrar el acceso de emergencia.';
            return null;
        } finally {
            _breakGlassSubmitting = false;
        }
    },

    clearBreakGlassError(): void {
        _breakGlassError = null;
    },

    reset(): void {
        _results    = [];
        _search     = '';
        _page       = 1;
        _totalPages = 0;
        _totalCount = 0;
        _loading    = false;
        _error      = null;
        _breakGlassSubmitting = false;
        _breakGlassError      = null;
    }
};
