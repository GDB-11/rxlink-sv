<!-- src/lib/features/inventory/components/InventoryStockPanel.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import type { InventoryItem } from '$lib/api/inventoryApi';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import MedicationPagination from '$lib/features/medications/components/MedicationPagination.svelte';
    import MedicationSearchBar from '$lib/features/medications/components/MedicationSearchBar.svelte';
    import { inventory } from '../stores/inventory.svelte';
    import { stockMovements } from '../stores/stockMovements.svelte';
    import InventoryTable from './InventoryTable.svelte';
    import LowStockToggle from './LowStockToggle.svelte';
    import MovementHistoryModal from './MovementHistoryModal.svelte';
    import StockMovementModal from './StockMovementModal.svelte';

    interface Props {
        /** Start with only low/out-of-stock items (the dashboard's KPI links here). */
        lowStockOnly?: boolean;
    }
    let { lowStockOnly = false }: Props = $props();

    let historyItem = $state<InventoryItem | null>(null);
    let registerItem = $state<InventoryItem | null>(null);

    onMount(() => {
        inventory.reset();
        // Set the filter without a second round trip: loadPage() below reads it.
        if (lowStockOnly) inventory.setLowStockOnly(true);
        else inventory.loadPage();
    });

    function openHistory(item: InventoryItem): void {
        historyItem = item;
        stockMovements.open(item.medicationCode);
    }

    function closeHistory(): void {
        historyItem = null;
        stockMovements.close();
    }

    function openRegister(item: InventoryItem): void {
        inventory.clearSubmitError();
        registerItem = item;
    }
</script>

<div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex-1">
            <MedicationSearchBar
                value={inventory.search}
                disabled={inventory.loading}
                onsearch={(v) => inventory.setSearch(v)}
            />
        </div>
        <LowStockToggle
            checked={inventory.lowStockOnly}
            disabled={inventory.loading}
            onchange={(v) => inventory.setLowStockOnly(v)}
        />
    </div>

    <ErrorAlert message={inventory.error} />

    <InventoryTable
        items={inventory.items}
        loading={inventory.loading}
        onhistory={openHistory}
        onregister={openRegister}
    />

    {#if inventory.totalCount > 0}
        <MedicationPagination
            page={inventory.page}
            pageSize={inventory.pageSize}
            totalCount={inventory.totalCount}
            totalPages={inventory.totalPages}
            loading={inventory.loading}
            onPageChange={(p) => inventory.setPage(p)}
        />
    {/if}
</div>

{#if historyItem}
    <MovementHistoryModal item={historyItem} onclose={closeHistory} />
{/if}

{#if registerItem}
    <StockMovementModal
        item={registerItem}
        submitting={inventory.submitting}
        error={inventory.submitError}
        onsubmit={(code, body) => inventory.registerMovement(code, body)}
        onclose={() => (registerItem = null)}
    />
{/if}
