<!-- src/lib/features/medical-profile/components/DiagnosticCard.svelte -->
<!-- Shows a single diagnostic with its prescription panel and doctor actions. -->
<script lang="ts">
    import { IconPencil, IconPlus } from '@tabler/icons-svelte';
    import type { DiagnosticResponse } from '$lib/api/diagnosticApi';
    import { medicalProfile } from '../stores/medicalProfile.svelte';
    import PrescriptionDetail from './PrescriptionDetail.svelte';
    import PrescriptionForm from './PrescriptionForm.svelte';

    interface Props {
        diagnostic: DiagnosticResponse;
        isDoctor:   boolean;
        isNurse:    boolean;
        onedit:     () => void;
    }
    let { diagnostic, isDoctor, isNurse, onedit }: Props = $props();

    let confirmToggle   = $state(false);
    let prescCreateOpen = $state(false);

    const isActive      = $derived(diagnostic.statusName === 'Activo');
    const canAddRx      = $derived(!diagnostic.prescription && isActive && isDoctor);

    async function handleToggleStatus(): Promise<void> {
        const ok = isActive
            ? await medicalProfile.deactivateDiagnostic(diagnostic.diagnosticCode)
            : await medicalProfile.activateDiagnostic(diagnostic.diagnosticCode);
        if (ok) confirmToggle = false;
    }

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

<div class="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm dark:border-stone-700 dark:bg-stone-800">

    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold {statusBadgeCls(diagnostic.statusName)}">
                    {diagnostic.statusName}
                </span>
                <span class="text-xs text-stone-400 dark:text-stone-500">
                    {fmtDate(diagnostic.diagnosedAt)}
                </span>
            </div>
            <p class="mt-1.5 text-sm font-medium text-stone-900 dark:text-stone-50">
                {diagnostic.description}
            </p>
            {#if diagnostic.notes}
                <p class="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    {diagnostic.notes}
                </p>
            {/if}
        </div>

        {#if isDoctor}
            <div class="flex shrink-0 items-center gap-1">
                <button
                    type="button"
                    onclick={onedit}
                    class="cursor-pointer rounded p-1.5 text-stone-400 transition-colors
                           hover:bg-stone-100 hover:text-stone-600
                           dark:hover:bg-stone-700 dark:hover:text-stone-300"
                    aria-label="Editar diagnóstico"
                >
                    <IconPencil size={15} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onclick={() => (confirmToggle = true)}
                    disabled={medicalProfile.submitting}
                    class="cursor-pointer rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-medium
                           text-stone-600 transition-colors hover:bg-stone-50
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700"
                >
                    {isActive ? 'Desactivar' : 'Activar'}
                </button>
            </div>
        {/if}
    </div>

    <!-- Prescription -->
    {#if diagnostic.prescription}
        <PrescriptionDetail
            prescription={diagnostic.prescription}
            diagnosticCode={diagnostic.diagnosticCode}
            {isDoctor}
            {isNurse}
        />
    {:else if canAddRx}
        <button
            type="button"
            onclick={() => (prescCreateOpen = true)}
            class="mt-3 flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed
                   border-teal-300 px-3 py-2 text-xs font-medium text-teal-600 transition-colors
                   hover:border-teal-400 hover:bg-teal-50
                   dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-900/20"
        >
            <IconPlus size={13} aria-hidden="true" />
            Crear receta
        </button>
    {/if}

</div>

<!-- Create prescription form -->
{#if prescCreateOpen}
    {#key diagnostic.diagnosticCode + '-rx-new'}
        <PrescriptionForm
            open={true}
            prescription={null}
            diagnosticCode={diagnostic.diagnosticCode}
            onclose={() => (prescCreateOpen = false)}
        />
    {/key}
{/if}

<!-- Deactivate / activate confirmation -->
{#if confirmToggle}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="alertdialog"
        aria-labelledby="diag-toggle-title"
        aria-describedby="diag-toggle-desc"
    >
        <div class="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">
            <div class="px-6 py-5">
                <h3 id="diag-toggle-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    {isActive ? 'Desactivar diagnóstico' : 'Activar diagnóstico'}
                </h3>
                <p id="diag-toggle-desc" class="mt-2 text-sm text-stone-600 dark:text-stone-400">
                    {#if isActive}
                        ¿Desactivar este diagnóstico? Podrás reactivarlo más adelante.
                    {:else}
                        ¿Activar este diagnóstico nuevamente?
                    {/if}
                </p>
                {#if medicalProfile.submitError}
                    <div class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                               text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                        {medicalProfile.submitError}
                    </div>
                {/if}
            </div>
            <div class="flex justify-end gap-3 border-t border-stone-200 px-6 py-4 dark:border-stone-700">
                <button
                    type="button"
                    onclick={() => { confirmToggle = false; medicalProfile.clearSubmitError(); }}
                    disabled={medicalProfile.submitting}
                    class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium
                           text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:border-stone-700 dark:text-stone-400
                           dark:hover:bg-stone-700 dark:hover:text-stone-50"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onclick={handleToggleStatus}
                    disabled={medicalProfile.submitting}
                    class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium
                           text-white transition-colors hover:bg-teal-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                    {medicalProfile.submitting
                        ? 'Procesando…'
                        : isActive ? 'Sí, desactivar' : 'Sí, activar'}
                </button>
            </div>
        </div>
    </div>
{/if}
