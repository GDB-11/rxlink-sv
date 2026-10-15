// src/lib/api/inventoryApi.ts

import { api } from './api';

export interface LowStockItem {
    medicationCode: string;
    name: string;
    stockQuantity: number;
    reorderLevel: number;
    status: 'Low' | 'Out';
}

export type StockStatus = 'InStock' | 'Low' | 'Out';

export interface InventoryItem {
    medicationCode: string;
    name: string;
    concentration: string;
    pharmaceuticalFormName: string;
    stockQuantity: number;
    reorderLevel: number | null;
    status: StockStatus;
}

export type StockMovementType = 'Entry' | 'Dispense' | 'Adjustment' | 'Loss' | 'Return';

export interface StockMovement {
    stockMovementCode: string;
    movementType: StockMovementType;
    /** +1 adds to the balance, -1 takes from it. */
    direction: 1 | -1;
    quantity: number;
    shortfallQuantity: number | null;
    batchNumber: string | null;
    /** ISO date (yyyy-MM-dd). */
    expiresOn: string | null;
    reason: string | null;
    username: string | null;
    occurredAt: string;
}

/** Movements that staff can register by hand (dispenses come from the dispensing flow). */
export interface RegisterStockMovement {
    movementType: 'Entry' | 'Adjustment' | 'Loss';
    /** Only for `Adjustment`: 1 increases the balance, -1 decreases it. */
    direction?: 1 | -1;
    quantity: number;
    batchNumber?: string;
    expiresOn?: string;
    /** Required for `Adjustment` and `Loss`. */
    reason?: string;
}

export interface StockReportItem {
    medicationCode: string;
    name: string;
    entries: number;
    returns: number;
    dispensed: number;
    losses: number;
    adjustments: number;
    shortfall: number;
    stockQuantity: number;
}

export interface Page<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const inventoryApi = {
    getLowStock(): Promise<LowStockItem[]> {
        return api.get<LowStockItem[]>('/api/inventory/low-stock');
    },

    getPage(page: number, pageSize: number, search: string, lowStockOnly: boolean): Promise<Page<InventoryItem>> {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (search.trim()) params.set('search', search.trim());
        if (lowStockOnly) params.set('lowStockOnly', 'true');
        return api.get<Page<InventoryItem>>(`/api/inventory?${params}`);
    },

    getMovements(medicationCode: string, page: number, pageSize: number): Promise<Page<StockMovement>> {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        return api.get<Page<StockMovement>>(`/api/inventory/${medicationCode}/movements?${params}`);
    },

    registerMovement(medicationCode: string, body: RegisterStockMovement): Promise<StockMovement> {
        return api.post<StockMovement>(`/api/inventory/${medicationCode}/movements`, body);
    },

    getReport(from: string, to: string): Promise<StockReportItem[]> {
        const params = new URLSearchParams({ from, to });
        return api.get<StockReportItem[]>(`/api/inventory/report?${params}`);
    }
};
