// src/lib/features/inventory/movementTypes.ts

import type { StockMovementType } from '$lib/api/inventoryApi';

export const movementLabels: Record<StockMovementType, string> = {
    Entry: 'Entrada',
    Dispense: 'Dispensación',
    Adjustment: 'Ajuste',
    Loss: 'Pérdida',
    Return: 'Devolución'
};

/** The movements staff can register by hand, as the form offers them. */
export type ManualKind = 'Entry' | 'AdjustmentUp' | 'AdjustmentDown' | 'Loss';

export const manualKinds: { id: ManualKind; label: string }[] = [
    { id: 'Entry', label: 'Entrada (compra, donación)' },
    { id: 'AdjustmentUp', label: 'Ajuste: aumentar stock' },
    { id: 'AdjustmentDown', label: 'Ajuste: disminuir stock' },
    { id: 'Loss', label: 'Pérdida (daño, vencimiento)' }
];

export function kindNeedsReason(kind: ManualKind): boolean {
    return kind !== 'Entry';
}
