<!-- src/lib/features/medical-profile/components/DiagnosticsSection.svelte -->
<!-- Lists diagnostics with pagination; manages add/edit diagnostic form. -->
<script lang="ts">
    import { IconPlus } from '@tabler/icons-svelte';
    import type { DiagnosticResponse } from '$lib/api/diagnosticApi';
    import { medicalProfile } from '../stores/medicalProfile.svelte';
    import DiagnosticCard from './DiagnosticCard.svelte';
    import DiagnosticForm from './DiagnosticForm.svelte';

    interface Props {
        diagnostics:     DiagnosticResponse[];
        page:            number;
        totalPages:      number;
        isDoctor:        boolean;
        isNurse:         boolean;
        appointmentCode: string | null;
    }
    let { diagnostics, page, totalPages, isDoctor, isNurse, appointmentCode }: Props = $props();

    let formOpen   = $state(false);
    let editTarget = $state<DiagnosticResponse | null>(null);

    function openAdd(): void {
        editTarget = null;
        formOpen   = true;
    }

    function openEdit(d: DiagnosticResponse): void {
        editTarget = d;
        formOpen   = true;
    }

    function closeForm(): void {
        formOpen   = false;
        editTarget = null;
    }
</script>

<div class="space-y-4">

    <!-- Section header -->
    <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold text-stone-900 dark:text-stone-50">
            Diagnósticos
            {#if medicalProfile.totalCount > 0}
                <span class="ml-1.5 text-sm font-normal text-stone-400 dark:text-stone-500">
                    ({medicalProfile.totalCount})
                </span>
            {/if}
        </h2>
        {#if isDoctor}
            <button
                type="button"
                onclick={openAdd}
                class="flex cursor-pointer items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-2
                       text-sm font-medium text-white transition-colors hover:bg-teal-600
                       dark:bg-teal-600 dark:hover:bg-teal-700"
            >
                <IconPlus size={15} aria-hidden="true" />
                Agregar diagnóstico
            </button>
        {/if}
    </div>

    <!-- Loading -->
    {#if medicalProfile.loading}
        <div class="flex items-center justify-center py-10">
            <span
                class="h-6 w-6 animate-spin rounded-full border-2 border-stone-200 border-t-teal-500
                       dark:border-stone-700 dark:border-t-teal-400"
                aria-hidden="true"
            ></span>
        </div>

    <!-- Error -->
    {:else if medicalProfile.error}
        <div class="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700
                    dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
            {medicalProfile.error}
        </div>

    <!-- Empty state -->
    {:else if diagnostics.length === 0}
        <div class="rounded-xl border border-dashed border-stone-200 px-5 py-10 text-center
                    dark:border-stone-700">
            <p class="text-sm text-stone-500 dark:text-stone-400">
                No hay diagnósticos registrados.
            </p>
            {#if isDoctor && appointmentCode}
                <button
                    type="button"
                    onclick={openAdd}
                    class="mt-4 cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium
                           text-white transition-colors hover:bg-teal-600
                           dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                    Agregar primer diagnóstico
                </button>
            {/if}
        </div>

    <!-- List -->
    {:else}
        <div class="space-y-4">
            {#each diagnostics as d (d.diagnosticCode)}
                <DiagnosticCard
                    diagnostic={d}
                    {isDoctor}
                    {isNurse}
                    onedit={() => openEdit(d)}
                />
            {/each}
        </div>

        <!-- Pagination -->
        {#if totalPages > 1}
            <div class="flex items-center justify-between border-t border-stone-200 pt-4 dark:border-stone-700">
                <button
                    type="button"
                    onclick={() => medicalProfile.setPage(page - 1)}
                    disabled={page <= 1 || medicalProfile.loading}
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
                    onclick={() => medicalProfile.setPage(page + 1)}
                    disabled={page >= totalPages || medicalProfile.loading}
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

<!-- Add / edit diagnostic form -->
{#if formOpen}
    {#key editTarget?.diagnosticCode ?? 'new'}
        <DiagnosticForm
            open={true}
            diagnostic={editTarget}
            {appointmentCode}
            onclose={closeForm}
        />
    {/key}
{/if}
