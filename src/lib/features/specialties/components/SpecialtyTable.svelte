<!-- src/lib/features/specialties/components/SpecialtyTable.svelte -->
<script lang="ts">
    import { IconPencil, IconBan, IconCircleCheck } from '@tabler/icons-svelte';
    import type { SpecialtyResponse } from '$lib/api/specialtyApi';
    import SpecialtyStatusBadge from './SpecialtyStatusBadge.svelte';

    interface Props {
        items: SpecialtyResponse[];
        loading: boolean;
        onEdit: (item: SpecialtyResponse) => void;
        onDeactivate: (item: SpecialtyResponse) => void;
        onActivate: (item: SpecialtyResponse) => void;
    }
    let { items, loading, onEdit, onDeactivate, onActivate }: Props = $props();

    const skeletonRows = [1, 2, 3, 4, 5];
</script>

<div class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/60">
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                    Nombre
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
                            <div class="h-4 w-48 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="px-4 py-3">
                            <div class="h-5 w-14 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="px-4 py-3"></td>
                    </tr>
                {/each}
            {:else if items.length === 0}
                <tr>
                    <td colspan="3" class="px-4 py-12 text-center">
                        <p class="text-sm text-stone-500 dark:text-stone-400">
                            No se encontraron especialidades.
                        </p>
                    </td>
                </tr>
            {:else}
                {#each items as item (item.specialtyCode)}
                    <tr class="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td class="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">
                            {item.name}
                        </td>
                        <td class="px-4 py-3">
                            <SpecialtyStatusBadge isActive={item.isActive} />
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-end gap-1">
                                <button
                                    type="button"
                                    onclick={() => onEdit(item)}
                                    class="cursor-pointer rounded-lg p-1.5 text-stone-500 transition-colors
                                           hover:bg-teal-50 hover:text-teal-700
                                           dark:text-stone-400 dark:hover:bg-teal-900/30 dark:hover:text-teal-400"
                                    aria-label="Editar {item.name}"
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
                                        aria-label="Desactivar {item.name}"
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
                                        aria-label="Activar {item.name}"
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
