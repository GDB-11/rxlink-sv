<!-- src/lib/features/reports/components/ReportTable.svelte -->
<script lang="ts">
    import type { ReportColumn } from '../reportDefinitions';

    interface Props {
        columns: ReportColumn[];
        rows:    object[];
        loading: boolean;
    }
    let { columns, rows, loading }: Props = $props();

    function cell(row: object, column: ReportColumn): string {
        const value = (row as Record<string, unknown>)[column.key];
        if (value === null || value === undefined || value === '') return '—';
        if (column.type === 'datetime') return new Date(String(value)).toLocaleString('es-PE');
        if (column.type === 'number')   return Number(value).toLocaleString('es-PE');
        return String(value);
    }
</script>

<div class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
    <table class="w-full text-left text-sm">
        <thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500
                      dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-400">
            <tr>
                {#each columns as column (column.key)}
                    <th scope="col" class="px-4 py-3 font-medium {column.type === 'number' ? 'text-right' : ''}">
                        {column.label}
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody class="divide-y divide-stone-100 dark:divide-stone-700/60">
            {#if loading}
                <tr>
                    <td colspan={columns.length} class="px-4 py-10 text-center text-stone-400">Cargando…</td>
                </tr>
            {:else if rows.length === 0}
                <tr>
                    <td colspan={columns.length} class="px-4 py-10 text-center text-stone-400">
                        Sin resultados en el rango seleccionado.
                    </td>
                </tr>
            {:else}
                {#each rows as row, i (i)}
                    <tr class="text-stone-800 dark:text-stone-200">
                        {#each columns as column (column.key)}
                            <td class="px-4 py-3 {column.type === 'number' ? 'text-right tabular-nums' : ''}">
                                {cell(row, column)}
                            </td>
                        {/each}
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
