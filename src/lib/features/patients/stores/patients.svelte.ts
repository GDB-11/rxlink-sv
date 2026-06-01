// src/lib/features/patients/stores/patients.svelte.ts

import { patientApi, type PatientResponse, type CreatePatientBody, type UpdatePatientBody } from '$lib/api/patientApi';

let _items       = $state<PatientResponse[]>([]);
let _totalCount  = $state(0);
let _page        = $state(1);
let _pageSize    = $state(20);
let _totalPages  = $state(0);
let _search      = $state('');
let _loading     = $state(false);
let _error       = $state<string | null>(null);
let _submitting  = $state(false);
let _submitError = $state<string | null>(null);

export const patients = {
    get items()       { return _items; },
    get totalCount()  { return _totalCount; },
    get page()        { return _page; },
    get pageSize()    { return _pageSize; },
    get totalPages()  { return _totalPages; },
    get search()      { return _search; },
    get loading()     { return _loading; },
    get error()       { return _error; },
    get submitting()  { return _submitting; },
    get submitError() { return _submitError; },

    async loadPage(): Promise<void> {
        _loading = true;
        _error   = null;
        try {
            const data = await patientApi.getPage(_page, _pageSize, _search || undefined);
            _items      = data.items;
            _totalCount = data.totalCount;
            _totalPages = data.totalPages;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar pacientes.';
        } finally {
            _loading = false;
        }
    },

    async setSearch(value: string): Promise<void> {
        _search = value;
        _page   = 1;
        await this.loadPage();
    },

    async setPage(p: number): Promise<void> {
        _page = p;
        await this.loadPage();
    },

    async create(body: CreatePatientBody): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await patientApi.create(body);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al registrar paciente.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async update(code: string, body: UpdatePatientBody): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await patientApi.update(code, body);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al actualizar paciente.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async deactivate(code: string): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await patientApi.deactivate(code);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al desactivar paciente.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async activate(code: string): Promise<boolean> {
        _submitting  = true;
        _submitError = null;
        try {
            await patientApi.activate(code);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al activar paciente.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    clearSubmitError(): void {
        _submitError = null;
    }
};
