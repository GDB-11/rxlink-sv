// src/lib/features/medications/stores/medications.svelte.ts

import { medicationsApi, type MedicationResponse, type MedicationRequestBody } from '$lib/api/medicationsApi';
import { lookupsApi } from '$lib/api/lookupsApi';

export interface LookupItem {
    id: number;
    name: string;
}

let _items = $state<MedicationResponse[]>([]);
let _totalCount = $state(0);
let _page = $state(1);
let _pageSize = $state(20);
let _totalPages = $state(0);
let _search = $state('');
let _loading = $state(false);
let _error = $state<string | null>(null);
let _submitting = $state(false);
let _submitError = $state<string | null>(null);

let _knownForms = $state<LookupItem[]>([]);
let _knownRoutes = $state<LookupItem[]>([]);
let _lookupsLoaded = false;

export const medications = {
    get items() { return _items; },
    get totalCount() { return _totalCount; },
    get page() { return _page; },
    get pageSize() { return _pageSize; },
    get totalPages() { return _totalPages; },
    get search() { return _search; },
    get loading() { return _loading; },
    get error() { return _error; },
    get submitting() { return _submitting; },
    get submitError() { return _submitError; },
    get knownForms() { return _knownForms; },
    get knownRoutes() { return _knownRoutes; },

    async loadPage(): Promise<void> {
        _loading = true;
        _error = null;

        const lookupsPromise = _lookupsLoaded ? Promise.resolve() : this._loadLookups();

        try {
            const [pageData] = await Promise.all([
                medicationsApi.getPage(_page, _pageSize, _search || undefined),
                lookupsPromise
            ]);
            _items = pageData.items;
            _totalCount = pageData.totalCount;
            _totalPages = pageData.totalPages;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar medicamentos.';
        } finally {
            _loading = false;
        }
    },

    async _loadLookups(): Promise<void> {
        try {
            const data = await lookupsApi.getMedicationLookups();
            _knownForms  = data.pharmaceuticalForms.map(f => ({ id: f.id, name: f.name }));
            _knownRoutes = data.administrationRoutes.map(r => ({ id: r.id, name: r.name }));
            _lookupsLoaded = true;
        } catch {
            // Non-fatal: form will show empty selects if this fails
        }
    },

    async setSearch(value: string): Promise<void> {
        _search = value;
        _page = 1;
        await this.loadPage();
    },

    async setPage(p: number): Promise<void> {
        _page = p;
        await this.loadPage();
    },

    async create(body: MedicationRequestBody): Promise<boolean> {
        _submitting = true;
        _submitError = null;
        try {
            await medicationsApi.create(body);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al crear medicamento.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async update(code: string, body: MedicationRequestBody): Promise<boolean> {
        _submitting = true;
        _submitError = null;
        try {
            await medicationsApi.update(code, body);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al actualizar medicamento.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async deactivate(code: string): Promise<boolean> {
        _submitting = true;
        _submitError = null;
        try {
            await medicationsApi.deactivate(code);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al desactivar medicamento.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    clearSubmitError(): void {
        _submitError = null;
    }
};
