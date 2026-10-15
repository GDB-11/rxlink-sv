<!-- src/lib/features/inventory/components/StockMovementModal.svelte -->
<script lang="ts">
    import type { InventoryItem, RegisterStockMovement } from '$lib/api/inventoryApi';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import ModalDialog from '$lib/components/ui/ModalDialog.svelte';
    import { kindNeedsReason, type ManualKind } from '../movementTypes';
    import StockMovementForm from './StockMovementForm.svelte';

    interface Props {
        /** The medication being adjusted. Mount the modal only while open: each mount starts a fresh form. */
        item: InventoryItem;
        submitting: boolean;
        error: string | null;
        onsubmit: (medicationCode: string, body: RegisterStockMovement) => Promise<boolean>;
        onclose: () => void;
    }
    let { item, submitting, error, onsubmit, onclose }: Props = $props();

    let kind = $state<ManualKind>('Entry');
    let quantity = $state('');
    let batchNumber = $state('');
    let expiresOn = $state('');
    let reason = $state('');

    const amount = $derived(Number(quantity));
    const canSubmit = $derived(
        !submitting && amount > 0 && Number.isFinite(amount) && (!kindNeedsReason(kind) || reason.trim().length > 0)
    );

    function buildBody(): RegisterStockMovement {
        const base = { quantity: amount };
        switch (kind) {
            case 'Entry':
                return {
                    ...base,
                    movementType: 'Entry',
                    batchNumber: batchNumber.trim() || undefined,
                    expiresOn: expiresOn || undefined
                };
            case 'Loss':
                return { ...base, movementType: 'Loss', reason: reason.trim() };
            default:
                return {
                    ...base,
                    movementType: 'Adjustment',
                    direction: kind === 'AdjustmentUp' ? 1 : -1,
                    reason: reason.trim()
                };
        }
    }

    async function handleSubmit(): Promise<void> {
        if (!canSubmit) return;
        if (await onsubmit(item.medicationCode, buildBody())) onclose();
    }
</script>

<ModalDialog open={true} title="Registrar movimiento — {item.name}" {onclose}>
    <p class="mb-4 text-sm text-stone-500 dark:text-stone-400">
        Stock actual: <strong class="font-medium text-stone-900 dark:text-stone-100">{item.stockQuantity.toLocaleString('es-PE')}</strong>
    </p>
    <StockMovementForm
        bind:kind
        bind:quantity
        bind:batchNumber
        bind:expiresOn
        bind:reason
        disabled={submitting}
    />
    <div class="mt-4"><ErrorAlert message={error} /></div>

    {#snippet footer()}
        <button
            type="button"
            onclick={onclose}
            disabled={submitting}
            class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600
                   transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50
                   dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700"
        >
            Cancelar
        </button>
        <button
            type="button"
            onclick={handleSubmit}
            disabled={!canSubmit}
            class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors
                   hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50
                   dark:bg-teal-600 dark:hover:bg-teal-700"
        >
            {submitting ? 'Guardando…' : 'Registrar'}
        </button>
    {/snippet}
</ModalDialog>
