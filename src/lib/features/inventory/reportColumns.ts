// src/lib/features/inventory/reportColumns.ts

import type { ReportColumn } from '$lib/features/reports/reportDefinitions';

export const stockReportColumns: ReportColumn[] = [
    { key: 'name', label: 'Medicamento' },
    { key: 'entries', label: 'Entradas', type: 'number' },
    { key: 'returns', label: 'Devoluciones', type: 'number' },
    { key: 'dispensed', label: 'Dispensado', type: 'number' },
    { key: 'losses', label: 'Pérdidas', type: 'number' },
    { key: 'adjustments', label: 'Ajustes (neto)', type: 'number' },
    { key: 'shortfall', label: 'Faltante', type: 'number' },
    { key: 'stockQuantity', label: 'Stock actual', type: 'number' }
];
