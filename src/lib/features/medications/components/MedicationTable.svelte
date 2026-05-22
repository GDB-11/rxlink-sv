<!-- src/lib/features/medications/components/MedicationTable.svelte -->
<script lang="ts">
    import { IconPencil, IconBan, IconCircleCheck } from '@tabler/icons-svelte';
    import type { MedicationResponse } from '$lib/api/medicationsApi';
    import MedicationStatusBadge from './MedicationStatusBadge.svelte';

    interface Props {
        items: MedicationResponse[];
        loading: boolean;
        onEdit: (item: MedicationResponse) => void;
        onDeactivate: (item: MedicationResponse) => void;
        onActivate: (item: MedicationResponse) => void;
    }
    let { items, loading, onEdit, onDeactivate, onActivate }: Props = $props();

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
                    Estado
                </th>
                <th class="px-4 py-3 text-right font-medium text-stone-600 dark:text-stone-400">
                    Acciones
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
                        <td class="px-4 py-3"></td>
                    </tr>
                {/each}
            {:else if items.length === 0}
                <tr>
                    <td colspan="7" class="px-4 py-12 text-center">
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
                            <MedicationStatusBadge isActive={item.isActive} />
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-end gap-1">
                                <button
                                    type="button"
                                    onclick={() => onEdit(item)}
                                    class="cursor-pointer rounded-lg p-1.5 text-stone-500 transition-colors
                                           hover:bg-teal-50 hover:text-teal-700
                                           dark:text-stone-400 dark:hover:bg-teal-900/30 dark:hover:text-teal-400"
                                    aria-label="Editar {item.genericName}"
                                >
                                    <IconPencil size={16} aria-hidden="true" />
                                </button>
                                {#if item.isActive}
                                    <button
                                        type="button"
                                        onclick={() => onDeactivate(item)}
                                        class="cursor-pointer rounded-lg p-1.5 text-stone-500 transition-colors
                                               hover:bg-rose-50 hover:text-rose-700
                                               dark:text-stone-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                                        aria-label="Desactivar {item.genericName}"
                                    >
                                        <IconBan size={16} aria-hidden="true" />
                                    </button>
                                {:else}
                                    <button
                                        type="button"
                                        onclick={() => onActivate(item)}
                                        class="cursor-pointer rounded-lg p-1.5 text-stone-500 transition-colors
                                               hover:bg-teal-50 hover:text-teal-700
                                               dark:text-stone-400 dark:hover:bg-teal-900/30 dark:hover:text-teal-400"
                                        aria-label="Activar {item.genericName}"
                                    >
                                        <IconCircleCheck size={16} aria-hidden="true" />
                                    </button>
                                {/if}
                            </div>
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
