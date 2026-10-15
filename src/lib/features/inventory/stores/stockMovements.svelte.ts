// src/lib/features/inventory/stores/stockMovements.svelte.ts

import { inventoryApi, type StockMovement } from '$lib/api/inventoryApi';

let _medicationCode = $state<string | null>(null);
let _items = $state<StockMovement[]>([]);
let _totalCount = $state(0);
let _page = $state(1);
let _pageSize = $state(10);
let _totalPages = $state(0);
let _loading = $state(false);
let _error = $state<string | null>(null);

export const stockMovements = {
    get medicationCode() { return _medicationCode; },
    get items() { return _items; },
    get totalCount() { return _totalCount; },
    get page() { return _page; },
    get pageSize() { return _pageSize; },
    get totalPages() { return _totalPages; },
    get loading() { return _loading; },
    get error() { return _error; },

    async open(medicationCode: string): Promise<void> {
        _medicationCode = medicationCode;
        _items = [];
        _page = 1;
        await this.load();
    },

    async setPage(p: number): Promise<void> {
        _page = p;
        await this.load();
    },

    async load(): Promise<void> {
        const code = _medicationCode;
        if (!code) return;
        _loading = true;
        _error = null;
        try {
            const data = await inventoryApi.getMovements(code, _page, _pageSize);
            if (code !== _medicationCode) return;
            _items = data.items;
            _totalCount = data.totalCount;
            _totalPages = data.totalPages;
        } catch (err) {
            if (code === _medicationCode)
                _error = err instanceof Error ? err.message : 'Error al cargar los movimientos.';
        } finally {
            if (code === _medicationCode) _loading = false;
        }
    },

    close(): void {
        _medicationCode = null;
        _items = [];
        _error = null;
    }
};
