<!-- src/lib/features/inventory/components/InventoryTable.svelte -->
<script lang="ts">
    import type { InventoryItem } from '$lib/api/inventoryApi';
    import StockStatusBadge from './StockStatusBadge.svelte';

    interface Props {
        items: InventoryItem[];
        loading: boolean;
        onhistory: (item: InventoryItem) => void;
        onregister: (item: InventoryItem) => void;
    }
    let { items, loading, onhistory, onregister }: Props = $props();

    const skeletonRows = [1, 2, 3, 4, 5];
    const headerClass = 'px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400';
    const actionClass = `cursor-pointer rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-medium
        text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900
        dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-50`;
</script>

<div class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/60">
                <th class={headerClass}>Medicamento</th>
                <th class="hidden md:table-cell {headerClass}">Presentación</th>
                <th class="{headerClass} text-right">Stock</th>
                <th class="hidden sm:table-cell {headerClass} text-right">Reposición</th>
                <th class={headerClass}>Estado</th>
                <th class="{headerClass} text-right">Acciones</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-stone-100 dark:divide-stone-800">
            {#if loading}
                {#each skeletonRows as n (n)}
                    <tr>
                        {#each [36, 28, 10, 10, 16, 24] as width, i (i)}
                            <td class="px-4 py-3 {i === 1 ? 'hidden md:table-cell' : ''} {i === 3 ? 'hidden sm:table-cell' : ''}">
                                <div class="h-4 animate-pulse rounded bg-stone-200 dark:bg-stone-700" style="width: {width * 4}px"></div>
                            </td>
                        {/each}
                    </tr>
                {/each}
            {:else if items.length === 0}
                <tr>
                    <td colspan="6" class="px-4 py-12 text-center text-sm text-stone-500 dark:text-stone-400">
                        No se encontraron medicamentos habilitados.
                    </td>
                </tr>
            {:else}
                {#each items as item (item.medicationCode)}
                    <tr class="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td class="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">{item.name}</td>
                        <td class="hidden px-4 py-3 text-stone-600 md:table-cell dark:text-stone-400">
                            {item.pharmaceuticalFormName} · {item.concentration}
                        </td>
                        <td class="px-4 py-3 text-right tabular-nums text-stone-900 dark:text-stone-50">
                            {item.stockQuantity.toLocaleString('es-PE')}
                        </td>
                        <td class="hidden px-4 py-3 text-right tabular-nums text-stone-600 sm:table-cell dark:text-stone-400">
                            {item.reorderLevel?.toLocaleString('es-PE') ?? '—'}
                        </td>
                        <td class="px-4 py-3"><StockStatusBadge status={item.status} /></td>
                        <td class="px-4 py-3">
                            <div class="flex justify-end gap-2">
                                <button type="button" class={actionClass} onclick={() => onhistory(item)}>Historial</button>
                                <button type="button" class={actionClass} onclick={() => onregister(item)}>Registrar</button>
                            </div>
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
