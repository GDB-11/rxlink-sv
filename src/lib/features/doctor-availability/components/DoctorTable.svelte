<!-- src/lib/features/doctor-availability/components/DoctorTable.svelte -->
<script lang="ts">
    import { IconCalendar } from '@tabler/icons-svelte';
    import type { UserResponse } from '$lib/api/userApi';

    interface Props {
        items:   UserResponse[];
        loading: boolean;
    }
    let { items, loading }: Props = $props();

    const skeletonRows = [1, 2, 3, 4, 5];
</script>

<div class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/60">
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                    Nombre completo
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 sm:table-cell">
                    Especialidad
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 md:table-cell">
                    Nro. de licencia
                </th>
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                    Estado
                </th>
                <th class="px-4 py-3 text-right font-medium text-stone-600 dark:text-stone-400">
                    Disponibilidad
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
                        <td class="hidden px-4 py-3 sm:table-cell">
                            <div class="h-4 w-28 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 md:table-cell">
                            <div class="h-4 w-24 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="px-4 py-3">
                            <div class="h-5 w-14 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="px-4 py-3"></td>
                    </tr>
                {/each}
            {:else if items.length === 0}
                <tr>
                    <td colspan="5" class="px-4 py-12 text-center">
                        <p class="text-sm text-stone-500 dark:text-stone-400">
                            No hay doctores registrados.
                        </p>
                    </td>
                </tr>
            {:else}
                {#each items as item (item.userCode)}
                    <tr class="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td class="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">
                            {item.surnames}, {item.names}
                        </td>
                        <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 sm:table-cell">
                            {item.specialtyName ?? '—'}
                        </td>
                        <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 md:table-cell">
                            {item.licenseNumber ?? '—'}
                        </td>
                        <td class="px-4 py-3">
                            {#if item.isActive}
                                <span class="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5
                                             text-xs font-medium text-teal-700
                                             dark:bg-teal-900/30 dark:text-teal-400">
                                    Activo
                                </span>
                            {:else}
                                <span class="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5
                                             text-xs font-medium text-stone-500
                                             dark:bg-stone-800 dark:text-stone-400">
                                    Inactivo
                                </span>
                            {/if}
                        </td>
                        <td class="px-4 py-3 text-right">
                            <a
                                href="/doctores/{item.userCode}/disponibilidad"
                                class="inline-flex items-center justify-center rounded-lg p-1.5
                                       text-stone-500 transition-colors
                                       hover:bg-teal-50 hover:text-teal-700
                                       dark:text-stone-400 dark:hover:bg-teal-900/30 dark:hover:text-teal-400"
                                title="Ver disponibilidad"
                                aria-label="Ver disponibilidad de {item.names} {item.surnames}"
                            >
                                <IconCalendar size={16} aria-hidden="true" />
                            </a>
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
