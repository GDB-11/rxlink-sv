// src/lib/features/inventory/stores/inventory.svelte.ts

import { inventoryApi, type InventoryItem, type RegisterStockMovement } from '$lib/api/inventoryApi';

let _items = $state<InventoryItem[]>([]);
let _totalCount = $state(0);
let _page = $state(1);
let _pageSize = $state(20);
let _totalPages = $state(0);
let _search = $state('');
let _lowStockOnly = $state(false);
let _loading = $state(false);
let _error = $state<string | null>(null);
let _submitting = $state(false);
let _submitError = $state<string | null>(null);

export const inventory = {
    get items() { return _items; },
    get totalCount() { return _totalCount; },
    get page() { return _page; },
    get pageSize() { return _pageSize; },
    get totalPages() { return _totalPages; },
    get search() { return _search; },
    get lowStockOnly() { return _lowStockOnly; },
    get loading() { return _loading; },
    get error() { return _error; },
    get submitting() { return _submitting; },
    get submitError() { return _submitError; },

    async loadPage(): Promise<void> {
        _loading = true;
        _error = null;
        try {
            const data = await inventoryApi.getPage(_page, _pageSize, _search, _lowStockOnly);
            _items = data.items;
            _totalCount = data.totalCount;
            _totalPages = data.totalPages;
        } catch (err) {
            _error = err instanceof Error ? err.message : 'Error al cargar el inventario.';
        } finally {
            _loading = false;
        }
    },

    async setSearch(value: string): Promise<void> {
        _search = value;
        _page = 1;
        await this.loadPage();
    },

    async setLowStockOnly(value: boolean): Promise<void> {
        _lowStockOnly = value;
        _page = 1;
        await this.loadPage();
    },

    async setPage(p: number): Promise<void> {
        _page = p;
        await this.loadPage();
    },

    /** Registers a movement and reloads the list so the balance is the server's. */
    async registerMovement(medicationCode: string, body: RegisterStockMovement): Promise<boolean> {
        _submitting = true;
        _submitError = null;
        try {
            await inventoryApi.registerMovement(medicationCode, body);
            await this.loadPage();
            return true;
        } catch (err) {
            _submitError = err instanceof Error ? err.message : 'Error al registrar el movimiento.';
            return false;
        } finally {
            _submitting = false;
        }
    },

    clearSubmitError(): void {
        _submitError = null;
    },

    reset(): void {
        _search = '';
        _lowStockOnly = false;
        _page = 1;
        _submitError = null;
    }
};
