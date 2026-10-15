<!-- src/lib/features/inventory/components/MovementHistoryModal.svelte -->
<script lang="ts">
    import type { InventoryItem } from '$lib/api/inventoryApi';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import ModalDialog from '$lib/components/ui/ModalDialog.svelte';
    import MedicationPagination from '$lib/features/medications/components/MedicationPagination.svelte';
    import { stockMovements } from '../stores/stockMovements.svelte';
    import StockMovementTable from './StockMovementTable.svelte';

    interface Props {
        /** The medication whose ledger is shown. Mount only while open. */
        item: InventoryItem;
        onclose: () => void;
    }
    let { item, onclose }: Props = $props();
</script>

<ModalDialog
    open={true}
    title="Movimientos — {item.name}"
    widthClass="max-w-4xl"
    {onclose}
>
    <div class="space-y-4">
        <ErrorAlert message={stockMovements.error} />
        <StockMovementTable items={stockMovements.items} loading={stockMovements.loading} />
        {#if stockMovements.totalCount > 0}
            <MedicationPagination
                page={stockMovements.page}
                pageSize={stockMovements.pageSize}
                totalCount={stockMovements.totalCount}
                totalPages={stockMovements.totalPages}
                loading={stockMovements.loading}
                onPageChange={(p) => stockMovements.setPage(p)}
            />
        {/if}
    </div>
</ModalDialog>
