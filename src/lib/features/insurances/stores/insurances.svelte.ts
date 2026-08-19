// src/lib/features/insurances/stores/insurances.svelte.ts

import { insuranceApi, type InsuranceResponse, type InsuranceRequestBody } from '$lib/api/insuranceApi';

let _items = $state<InsuranceResponse[]>([]);
let _totalCount = $state(0);
let _page = $state(1);
const _pageSize = $state(20);
let _totalPages = $state(0);
let _search = $state('');
let _loading = $state(false);
let _error = $state<string | null>(null);
let _submitting = $state(false);
let _submitError = $state<string | null>(null);

export const insurances = {
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
            const pageData = await insuranceApi.getPage(_page, _pageSize, _search || undefined);
            _items = pageData.items;
            _totalCount = pageData.totalCount;
            _totalPages = pageData.totalPages;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar seguros.';
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

    async create(body: InsuranceRequestBody): Promise<boolean> {
        _submitting = true;
        _submitError = null;
        try {
            await insuranceApi.create(body);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al crear seguro.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async update(code: string, body: InsuranceRequestBody): Promise<boolean> {
        _submitting = true;
        _submitError = null;
        try {
            await insuranceApi.update(code, body);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al actualizar seguro.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async deactivate(code: string): Promise<boolean> {
        _submitting = true;
        _submitError = null;
        try {
            await insuranceApi.deactivate(code);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al desactivar seguro.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    async activate(code: string): Promise<boolean> {
        _submitting = true;
        _submitError = null;
        try {
            await insuranceApi.activate(code);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al activar seguro.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    clearSubmitError(): void {
        _submitError = null;
    }
};
