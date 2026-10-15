<!-- src/lib/features/insurances/components/InsuranceTable.svelte -->
<script lang="ts">
    import type { InsuranceResponse } from '$lib/api/insuranceApi';
    import CatalogStatusBadge from '$lib/components/ui/CatalogStatusBadge.svelte';
    import InlineNumberEditor from '$lib/components/ui/InlineNumberEditor.svelte';
    import ToggleSwitch from '$lib/components/ui/ToggleSwitch.svelte';

    interface Props {
        items: InsuranceResponse[];
        loading: boolean;
        busy?: boolean;
        onToggle: (item: InsuranceResponse, enabled: boolean) => void;
        onCoverage: (item: InsuranceResponse, value: number) => Promise<boolean>;
        onClearCoverage: (item: InsuranceResponse) => Promise<boolean>;
    }
    let { items, loading, busy = false, onToggle, onCoverage, onClearCoverage }: Props = $props();

    const skeletonRows = [1, 2, 3, 4, 5];
</script>

<div class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/60">
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">Nombre</th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 sm:table-cell">Cobertura del catálogo</th>
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">Cobertura del centro</th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 sm:table-cell">Catálogo</th>
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">Aceptado</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-stone-100 dark:divide-stone-800">
            {#if loading}
                {#each skeletonRows as n (n)}
                    <tr>
                        <td class="px-4 py-3"><div class="h-4 w-48 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div></td>
                        <td class="hidden px-4 py-3 sm:table-cell"><div class="h-4 w-12 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div></td>
                        <td class="px-4 py-3"><div class="h-4 w-12 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div></td>
                        <td class="hidden px-4 py-3 sm:table-cell"><div class="h-5 w-14 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700"></div></td>
                        <td class="px-4 py-3"><div class="h-5 w-9 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700"></div></td>
                    </tr>
                {/each}
            {:else if items.length === 0}
                <tr>
                    <td colspan="5" class="px-4 py-12 text-center">
                        <p class="text-sm text-stone-500 dark:text-stone-400">No se encontraron seguros.</p>
                    </td>
                </tr>
            {:else}
                {#each items as item (item.insuranceCode)}
                    <tr class="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td class="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">{item.name}</td>
                        <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 sm:table-cell">
                            {item.defaultCoveragePercentage}%
                        </td>
                        <td class="px-4 py-3">
                            <InlineNumberEditor
                                value={item.coveragePercentageOverride}
                                display="{item.coveragePercentage}%{item.coveragePercentageOverride === null ? ' (catálogo)' : ''}"
                                label={item.name}
                                field="cobertura"
                                max={100}
                                clearLabel="Volver al valor del catálogo:"
                                disabled={busy}
                                onsave={(v) => onCoverage(item, v)}
                                onclear={() => onClearCoverage(item)}
                            />
                        </td>
                        <td class="hidden px-4 py-3 sm:table-cell"><CatalogStatusBadge isActive={item.isActive} /></td>
                        <td class="px-4 py-3">
                            <ToggleSwitch
                                checked={item.isEnabled}
                                label="Aceptar {item.name}"
                                disabled={busy || (!item.isActive && !item.isEnabled)}
                                onchange={(v) => onToggle(item, v)}
                            />
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
