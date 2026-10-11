// src/lib/features/reports/stores/reports.svelte.ts

import { todayIso } from '$lib/utils/date';
import { reportDefinitions, type ReportKind } from '../reportDefinitions';

const MAX_RANGE_DAYS = 366;

function daysAgoIso(days: number): string {
    const d = new Date(Date.now() - days * 86_400_000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayNumber(iso: string): number {
    return Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86_400_000);
}

let _kind    = $state<ReportKind>('activity');
let _from    = $state(daysAgoIso(7));
let _to      = $state(todayIso());
let _rows    = $state<object[]>([]);
let _loading = $state(false);
let _error   = $state<string | null>(null);

export const reports = {
    get kind():    ReportKind     { return _kind; },
    get from():    string         { return _from; },
    get to():      string         { return _to; },
    get rows():    object[]       { return _rows; },
    get loading(): boolean        { return _loading; },
    get error():   string | null  { return _error; },

    async setKind(kind: ReportKind): Promise<void> {
        _kind = kind;
        await this.load();
    },

    async setRange(from: string, to: string): Promise<void> {
        _from = from;
        _to   = to;
        await this.load();
    },

    async load(): Promise<void> {
        if (!_from || !_to) return;
        if (_from > _to || dayNumber(_to) - dayNumber(_from) >= MAX_RANGE_DAYS) {
            _rows  = [];
            _error = `Elija un rango válido: "desde" no puede ser posterior a "hasta" y el máximo es ${MAX_RANGE_DAYS} días.`;
            return;
        }

        const definition = reportDefinitions.find(d => d.kind === _kind)!;
        const requested  = _kind;
        _loading = true;
        _error   = null;
        try {
            const rows = await definition.fetch(_from, _to);
            if (requested === _kind) _rows = rows;
        } catch (err) {
            if (requested === _kind) {
                _rows  = [];
                _error = err instanceof Error ? err.message : 'Error al generar el reporte.';
            }
        } finally {
            if (requested === _kind) _loading = false;
        }
    },

    reset(): void {
        _kind    = 'activity';
        _from    = daysAgoIso(7);
        _to      = todayIso();
        _rows    = [];
        _loading = false;
        _error   = null;
    }
};
