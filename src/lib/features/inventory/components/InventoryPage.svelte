<!-- src/lib/features/inventory/components/InventoryPage.svelte -->
<script lang="ts">
    import TabBar from '$lib/components/ui/TabBar.svelte';
    import InventoryReportPanel from './InventoryReportPanel.svelte';
    import InventoryStockPanel from './InventoryStockPanel.svelte';

    type Tab = 'stock' | 'report';

    interface Props {
        lowStockOnly?: boolean;
    }
    let { lowStockOnly = false }: Props = $props();

    const tabs: { id: Tab; label: string }[] = [
        { id: 'stock', label: 'Existencias' },
        { id: 'report', label: 'Informe de movimientos' }
    ];
    let active = $state<Tab>('stock');
</script>

<div class="space-y-6">
    <div>
        <h1 class="text-2xl font-semibold text-stone-900 dark:text-stone-50" style="font-family: 'Instrument Serif', serif;">
            Inventario
        </h1>
        <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Stock del centro: registra entradas, ajustes y pérdidas, y revisa el historial de cada medicamento.
        </p>
    </div>

    <TabBar {tabs} {active} label="Inventario" onselect={(id) => (active = id)} />

    {#if active === 'stock'}
        <InventoryStockPanel {lowStockOnly} />
    {:else}
        <InventoryReportPanel />
    {/if}
</div>
