<!-- src/lib/features/medications/components/MedicationTable.svelte -->
<script lang="ts">
    import type { MedicationResponse } from '$lib/api/medicationApi';
    import ToggleSwitch from '$lib/components/ui/ToggleSwitch.svelte';
    import CatalogStatusBadge from '$lib/components/ui/CatalogStatusBadge.svelte';
    import InlineNumberEditor from '$lib/components/ui/InlineNumberEditor.svelte';

    interface Props {
        items: MedicationResponse[];
        loading: boolean;
        busy?: boolean;
        onToggle: (item: MedicationResponse, enabled: boolean) => void;
        onReorderLevel: (item: MedicationResponse, value: number) => Promise<boolean>;
    }
    let { items, loading, busy = false, onToggle, onReorderLevel }: Props = $props();

    const skeletonRows = [1, 2, 3, 4, 5];
</script>

<div class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/60">
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                    Nombre genérico
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 sm:table-cell">
                    Nombre comercial
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 lg:table-cell">
                    Forma farmacéutica
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 lg:table-cell">
                    Vía de administración
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 md:table-cell">
                    Concentración
                </th>
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                    Catálogo
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 md:table-cell">
                    Stock
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 md:table-cell">
                    Reposición
                </th>
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                    Habilitado
                </th>
            </tr>
        </thead>
        <tbody class="divide-y divide-stone-100 dark:divide-stone-800">
            {#if loading}
                {#each skeletonRows as n (n)}
                    <tr>
                        <td class="px-4 py-3">
                            <div class="h-4 w-36 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 sm:table-cell">
                            <div class="h-4 w-28 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 lg:table-cell">
                            <div class="h-4 w-24 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 lg:table-cell">
                            <div class="h-4 w-20 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 md:table-cell">
                            <div class="h-4 w-16 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="px-4 py-3">
                            <div class="h-5 w-14 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 md:table-cell">
                            <div class="h-4 w-10 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 md:table-cell">
                            <div class="h-4 w-10 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="px-4 py-3">
                            <div class="h-5 w-9 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                    </tr>
                {/each}
            {:else if items.length === 0}
                <tr>
                    <td colspan="9" class="px-4 py-12 text-center">
                        <p class="text-sm text-stone-500 dark:text-stone-400">
                            No se encontraron medicamentos.
                        </p>
                    </td>
                </tr>
            {:else}
                {#each items as item (item.medicationCode)}
                    <tr class="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td class="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">
                            {item.genericName}
                        </td>
                        <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 sm:table-cell">
                            {item.commercialName ?? '—'}
                        </td>
                        <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 lg:table-cell">
                            {item.pharmaceuticalFormName}
                        </td>
                        <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 lg:table-cell">
                            {item.administrationRouteName}
                        </td>
                        <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 md:table-cell">
                            {item.concentration}
                        </td>
                        <td class="px-4 py-3">
                            <CatalogStatusBadge isActive={item.isActive} />
                        </td>
                        <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 md:table-cell">
                            {item.stockQuantity ?? '—'}
                        </td>
                        <td class="hidden px-4 py-3 md:table-cell">
                            <InlineNumberEditor
                                value={item.reorderLevel}
                                label={item.genericName}
                                field="nivel de reposición"
                                disabled={busy}
                                onsave={(v) => onReorderLevel(item, v)}
                            />
                        </td>
                        <td class="px-4 py-3">
                            <ToggleSwitch
                                checked={item.isEnabled}
                                label="Habilitar {item.genericName}"
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
