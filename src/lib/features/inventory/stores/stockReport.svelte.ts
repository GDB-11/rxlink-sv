// src/lib/features/inventory/stores/stockReport.svelte.ts

import { inventoryApi, type StockReportItem } from '$lib/api/inventoryApi';
import { todayIso } from '$lib/utils/date';

const MAX_RANGE_DAYS = 366;

function daysAgoIso(days: number): string {
    const d = new Date(Date.now() - days * 86_400_000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayNumber(iso: string): number {
    return Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86_400_000);
}

let _from = $state(daysAgoIso(30));
let _to = $state(todayIso());
let _rows = $state<StockReportItem[]>([]);
let _loading = $state(false);
let _error = $state<string | null>(null);

export const stockReport = {
    get from() { return _from; },
    get to() { return _to; },
    get rows() { return _rows; },
    get loading() { return _loading; },
    get error() { return _error; },

    async setRange(from: string, to: string): Promise<void> {
        _from = from;
        _to = to;
        await this.load();
    },

    async load(): Promise<void> {
        if (!_from || !_to) return;
        if (_from > _to || dayNumber(_to) - dayNumber(_from) >= MAX_RANGE_DAYS) {
            _rows = [];
            _error = `Elija un rango válido: "desde" no puede ser posterior a "hasta" y el máximo es ${MAX_RANGE_DAYS} días.`;
            return;
        }
        _loading = true;
        _error = null;
        try {
            _rows = await inventoryApi.getReport(_from, _to);
        } catch (err) {
            _rows = [];
            _error = err instanceof Error ? err.message : 'Error al generar el reporte.';
        } finally {
            _loading = false;
        }
    }
};
