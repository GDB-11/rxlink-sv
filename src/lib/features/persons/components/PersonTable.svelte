<!-- src/lib/features/persons/components/PersonTable.svelte -->
<script lang="ts">
    import { IconPencil } from '@tabler/icons-svelte';
    import type { PersonResponse } from '$lib/api/personApi';

    interface Props {
        items: PersonResponse[];
        loading: boolean;
        onEdit: (item: PersonResponse) => void;
    }
    let { items, loading, onEdit }: Props = $props();

    const skeletonRows = [1, 2, 3, 4, 5];
</script>

<div class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/60">
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                    Nombre completo
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 md:table-cell">
                    Documento
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 sm:table-cell">
                    Correo
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 lg:table-cell">
                    Teléfono
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 xl:table-cell">
                    Sexo
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
                            <div class="h-4 w-40 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 md:table-cell">
                            <div class="h-4 w-28 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 sm:table-cell">
                            <div class="h-4 w-36 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 lg:table-cell">
                            <div class="h-4 w-24 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 xl:table-cell">
                            <div class="h-4 w-20 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="px-4 py-3"></td>
                    </tr>
                {/each}
            {:else if items.length === 0}
                <tr>
                    <td colspan="6" class="px-4 py-12 text-center">
                        <p class="text-sm text-stone-500 dark:text-stone-400">
                            No se encontraron personas.
                        </p>
                    </td>
                </tr>
            {:else}
                {#each items as item (item.personCode)}
                    <tr class="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td class="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">
                            {item.surnames}, {item.names}
                        </td>
                        <td class="hidden px-4 py-3 md:table-cell">
                            {#if item.documentTypeName && item.documentNumber}
                                <span class="text-xs font-medium text-stone-500 dark:text-stone-400">{item.documentTypeName}</span>
                                <span class="ml-1 text-stone-900 dark:text-stone-50">{item.documentNumber}</span>
                            {:else}
                                <span class="text-stone-400 dark:text-stone-600">—</span>
                            {/if}
                        </td>
                        <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 sm:table-cell">
                            {item.email}
                        </td>
                        <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 lg:table-cell">
                            {item.phone}
                        </td>
                        <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 xl:table-cell">
                            {item.sexName}
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-end">
                                <button
                                    type="button"
                                    onclick={() => onEdit(item)}
                                    class="cursor-pointer rounded-lg p-1.5 text-stone-500 transition-colors
                                           hover:bg-teal-50 hover:text-teal-700
                                           dark:text-stone-400 dark:hover:bg-teal-900/30 dark:hover:text-teal-400"
                                    aria-label="Editar {item.names} {item.surnames}"
                                >
                                    <IconPencil size={16} aria-hidden="true" />
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
