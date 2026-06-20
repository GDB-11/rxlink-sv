<!-- src/lib/features/nurse/components/NurseDiagnosticsSection.svelte -->
<script lang="ts">
    import type { DiagnosticResponse } from '$lib/api/diagnosticApi';
    import NursePrescriptionCard from './NursePrescriptionCard.svelte';

    interface Props {
        diagnostics: DiagnosticResponse[];
        loading:     boolean;
        totalCount:  number;
        page:        number;
        totalPages:  number;
        onpage:      (p: number) => void;
        ondispense:  (prescriptionCode: string) => void;
    }
    let { diagnostics, loading, totalCount, page, totalPages, onpage, ondispense }: Props = $props();

    const skeletonCards = [1, 2, 3];

    function statusBadgeCls(status: string): string {
        return status === 'Activo'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
            : 'bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400';
    }

    function fmtDate(s: string): string {
        return new Date(s.length === 10 ? s + 'T00:00:00' : s)
            .toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });
    }
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold text-stone-900 dark:text-stone-50">
            Diagnósticos
            {#if totalCount > 0}
                <span class="ml-1.5 text-sm font-normal text-stone-400 dark:text-stone-500">
                    ({totalCount})
                </span>
            {/if}
        </h2>
    </div>

    {#if loading}
        <div class="space-y-4">
            {#each skeletonCards as n (n)}
                <div class="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm
                            dark:border-stone-700 dark:bg-stone-800">
                    <div class="h-4 w-24 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                    <div class="mt-2 h-4 w-64 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                    <div class="mt-3 h-12 w-full animate-pulse rounded-lg bg-stone-100 dark:bg-stone-700/50"></div>
                </div>
            {/each}
        </div>

    {:else if diagnostics.length === 0}
        <div class="rounded-xl border border-dashed border-stone-200 px-5 py-10 text-center
                    dark:border-stone-700">
            <p class="text-sm text-stone-500 dark:text-stone-400">
                No hay diagnósticos registrados.
            </p>
        </div>

    {:else}
        <div class="space-y-4">
            {#each diagnostics as d (d.diagnosticCode)}
                <div class="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm
                            dark:border-stone-700 dark:bg-stone-800">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold {statusBadgeCls(d.statusName)}">
                            {d.statusName}
                        </span>
                        <span class="text-xs text-stone-400 dark:text-stone-500">
                            {fmtDate(d.diagnosedAt)}
                        </span>
                    </div>
                    <p class="mt-1.5 text-sm font-medium text-stone-900 dark:text-stone-50">
                        {d.description}
                    </p>
                    {#if d.notes}
                        <p class="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{d.notes}</p>
                    {/if}

                    {#if d.prescription}
                        <NursePrescriptionCard
                            prescription={d.prescription}
                            {ondispense}
                        />
                    {:else}
                        <p class="mt-3 text-xs text-stone-400 dark:text-stone-500">Sin receta.</p>
                    {/if}
                </div>
            {/each}
        </div>

        {#if totalPages > 1}
            <div class="flex items-center justify-between border-t border-stone-200 pt-4 dark:border-stone-700">
                <button
                    type="button"
                    onclick={() => onpage(page - 1)}
                    disabled={page <= 1 || loading}
                    class="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-sm
                           font-medium text-stone-600 transition-colors hover:bg-stone-50
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700"
                >
                    Anterior
                </button>
                <span class="text-sm text-stone-500 dark:text-stone-400">
                    Página {page} de {totalPages}
                </span>
                <button
                    type="button"
                    onclick={() => onpage(page + 1)}
                    disabled={page >= totalPages || loading}
                    class="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-sm
                           font-medium text-stone-600 transition-colors hover:bg-stone-50
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700"
                >
                    Siguiente
                </button>
            </div>
        {/if}
    {/if}
</div>
