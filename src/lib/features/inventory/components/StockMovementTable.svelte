<!-- src/lib/features/inventory/components/StockMovementTable.svelte -->
<script lang="ts">
    import type { StockMovement } from '$lib/api/inventoryApi';
    import { movementLabels } from '../movementTypes';

    interface Props {
        items: StockMovement[];
        loading: boolean;
    }
    let { items, loading }: Props = $props();

    const headerClass = 'px-3 py-2 text-left font-medium text-stone-600 dark:text-stone-400';

    function detail(m: StockMovement): string {
        const parts: string[] = [];
        if (m.batchNumber) parts.push(`Lote ${m.batchNumber}`);
        if (m.expiresOn) parts.push(`vence ${m.expiresOn.split('-').reverse().join('/')}`);
        if (m.shortfallQuantity) parts.push(`faltante ${m.shortfallQuantity.toLocaleString('es-PE')}`);
        if (m.reason) parts.push(m.reason);
        return parts.join(' · ') || '—';
    }
</script>

<div class="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
    <table class="w-full text-sm">
        <thead class="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/60">
            <tr>
                <th class={headerClass}>Fecha</th>
                <th class={headerClass}>Tipo</th>
                <th class="{headerClass} text-right">Cantidad</th>
                <th class={headerClass}>Detalle</th>
                <th class={headerClass}>Usuario</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-stone-100 dark:divide-stone-800">
            {#if loading}
                <tr><td colspan="5" class="px-3 py-8 text-center text-stone-400">Cargando…</td></tr>
            {:else if items.length === 0}
                <tr><td colspan="5" class="px-3 py-8 text-center text-stone-400">Sin movimientos registrados.</td></tr>
            {:else}
                {#each items as m (m.stockMovementCode)}
                    <tr class="text-stone-800 dark:text-stone-200">
                        <td class="whitespace-nowrap px-3 py-2">{new Date(m.occurredAt).toLocaleString('es-PE')}</td>
                        <td class="px-3 py-2">{movementLabels[m.movementType]}</td>
                        <td class="px-3 py-2 text-right tabular-nums font-medium
                                   {m.direction > 0 ? 'text-teal-700 dark:text-teal-400' : 'text-rose-700 dark:text-rose-400'}">
                            {m.direction > 0 ? '+' : '−'}{m.quantity.toLocaleString('es-PE')}
                        </td>
                        <td class="px-3 py-2 text-stone-600 dark:text-stone-400">{detail(m)}</td>
                        <td class="px-3 py-2 text-stone-600 dark:text-stone-400">{m.username ?? '—'}</td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
