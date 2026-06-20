<!-- src/lib/features/nurse/components/NursePatientResults.svelte -->
<script lang="ts">
    import type { PatientResponse } from '$lib/api/patientApi';

    interface Props {
        items:      PatientResponse[];
        loading:    boolean;
        search:     string;
        totalCount: number;
        page:       number;
        totalPages: number;
        onpage:     (p: number) => void;
    }
    let { items, loading, search, totalCount, page, totalPages, onpage }: Props = $props();

    const skeletonRows = [1, 2, 3, 4, 5];
    const start = $derived((page - 1) * 20 + 1);
    const end   = $derived(Math.min(page * 20, totalCount));
</script>

<div class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/60">
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                    Expediente
                </th>
                <th class="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                    Nombre completo
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 sm:table-cell">
                    Teléfono
                </th>
                <th class="hidden px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400 md:table-cell">
                    Estado
                </th>
                <th class="px-4 py-3 text-right font-medium text-stone-600 dark:text-stone-400">
                    Acción
                </th>
            </tr>
        </thead>
        <tbody class="divide-y divide-stone-100 dark:divide-stone-800">
            {#if loading}
                {#each skeletonRows as n (n)}
                    <tr>
                        <td class="px-4 py-3">
                            <div class="h-4 w-24 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="px-4 py-3">
                            <div class="h-4 w-40 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 sm:table-cell">
                            <div class="h-4 w-28 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="hidden px-4 py-3 md:table-cell">
                            <div class="h-5 w-14 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700"></div>
                        </td>
                        <td class="px-4 py-3"></td>
                    </tr>
                {/each}
            {:else if items.length === 0 && !search.trim()}
                <tr>
                    <td colspan="5" class="px-4 py-12 text-center">
                        <p class="text-sm text-stone-400 dark:text-stone-500">
                            Ingrese un nombre o número de expediente para buscar.
                        </p>
                    </td>
                </tr>
            {:else if items.length === 0}
                <tr>
                    <td colspan="5" class="px-4 py-12 text-center">
                        <p class="text-sm text-stone-500 dark:text-stone-400">
                            No se encontraron pacientes.
                        </p>
                    </td>
                </tr>
            {:else}
                {#each items as item (item.patientCode)}
                    <tr class="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td class="px-4 py-3 text-stone-600 dark:text-stone-400">
                            {item.medicalRecordNumber}
                        </td>
                        <td class="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">
                            {item.surnames}, {item.names}
                        </td>
                        <td class="hidden px-4 py-3 text-stone-600 dark:text-stone-400 sm:table-cell">
                            {item.phone || '—'}
                        </td>
                        <td class="hidden px-4 py-3 md:table-cell">
                            {#if item.isActive}
                                <span class="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs
                                             font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                                    Activo
                                </span>
                            {:else}
                                <span class="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs
                                             font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                                    Inactivo
                                </span>
                            {/if}
                        </td>
                        <td class="px-4 py-3 text-right">
                            <a
                                href="/enfermero/pacientes/{item.patientCode}"
                                class="inline-flex cursor-pointer items-center rounded-lg bg-teal-500 px-3 py-1.5
                                       text-xs font-medium text-white transition-colors hover:bg-teal-600
                                       dark:bg-teal-600 dark:hover:bg-teal-700"
                            >
                                Ver historial
                            </a>
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>

{#if totalPages > 1}
    <div class="mt-4 flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
        <span>
            Mostrando {start}–{end} de {totalCount} paciente{totalCount !== 1 ? 's' : ''}
        </span>
        <div class="flex gap-1">
            <button
                type="button"
                onclick={() => onpage(page - 1)}
                disabled={page <= 1 || loading}
                class="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs
                       transition-colors hover:bg-stone-50
                       disabled:cursor-not-allowed disabled:opacity-40
                       dark:border-stone-700 dark:hover:bg-stone-800"
            >
                Anterior
            </button>
            <button
                type="button"
                onclick={() => onpage(page + 1)}
                disabled={page >= totalPages || loading}
                class="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs
                       transition-colors hover:bg-stone-50
                       disabled:cursor-not-allowed disabled:opacity-40
                       dark:border-stone-700 dark:hover:bg-stone-800"
            >
                Siguiente
            </button>
        </div>
    </div>
{/if}
