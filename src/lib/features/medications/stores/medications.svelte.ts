// src/lib/features/medications/stores/medications.svelte.ts

import {
    medicationApi,
    type MedicationResponse,
    type PartnerMedicationUpdate
} from '$lib/api/medicationApi';

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

    async loadPage(): Promise<void> {
        _loading = true;
        _error = null;
        try {
            const pageData = await medicationApi.getPage(_page, _pageSize, _search || undefined);
            _items = pageData.items;
            _totalCount = pageData.totalCount;
            _totalPages = pageData.totalPages;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar medicamentos.';
        } finally {
            _loading = false;
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

    /** Applies a partner-side change and patches the row in place (no page reload). */
    async updatePartner(code: string, body: PartnerMedicationUpdate): Promise<boolean> {
        _submitting = true;
        _submitError = null;
        try {
            const saved = await medicationApi.updatePartner(code, body);
            _items = _items.map((m) =>
                m.medicationCode === code
                    ? { ...m, isEnabled: saved.isEnabled, reorderLevel: saved.reorderLevel }
                    : m
            );
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al actualizar medicamento.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    clearSubmitError(): void {
        _submitError = null;
    }
};
