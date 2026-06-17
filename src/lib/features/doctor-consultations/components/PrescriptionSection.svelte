<!-- src/lib/features/doctor-consultations/components/PrescriptionSection.svelte -->
<script lang="ts">
    import { IconChevronDown, IconAlertTriangle } from '@tabler/icons-svelte';
    import { prescriptionApi, type PrescriptionResponse } from '$lib/api/prescriptionApi';
    import type { DiagnosticResponse, PrescriptionSummaryResponse } from '$lib/api/diagnosticApi';
    import PrescriptionForm from '$lib/features/medical-profile/components/PrescriptionForm.svelte';
    import { consultationRoom } from '../stores/consultationRoom.svelte';

    interface Props {
        diagnostic:  DiagnosticResponse;
        isReadOnly:  boolean;
    }
    let { diagnostic, isReadOnly }: Props = $props();

    const prescription = $derived(diagnostic.prescription);

    let expanded         = $state(false);
    let fullPrescription = $state<PrescriptionResponse | null>(null);
    let loadingFull      = $state(false);
    let loadError        = $state<string | null>(null);
    let submitting       = $state(false);
    let submitError      = $state<string | null>(null);
    let confirmCancel    = $state(false);
    let rxFormOpen       = $state(false);

    const canSign       = $derived(prescription?.statusName === 'Borrador' && !isReadOnly);
    const canEdit       = $derived(prescription?.statusName === 'Borrador' && !isReadOnly);
    const canSuspend    = $derived(prescription?.statusName === 'Activo' && !isReadOnly);
    const canReactivate = $derived(prescription?.statusName === 'Suspendido' && !isReadOnly);
    const canCancel     = $derived(
        prescription !== null &&
        ['Borrador', 'Activo', 'Suspendido'].includes(prescription?.statusName ?? '') &&
        !isReadOnly
    );

    async function toggleExpand(): Promise<void> {
        if (expanded) { expanded = false; return; }
        if (fullPrescription) { expanded = true; return; }
        if (!prescription) return;
        loadingFull = true;
        loadError   = null;
        try {
            fullPrescription = await prescriptionApi.getPrescription(prescription.prescriptionCode);
            expanded = true;
        } catch {
            loadError = 'Error al cargar los detalles de la receta.';
        } finally {
            loadingFull = false;
        }
    }

    function collapseAndReset(): void {
        expanded         = false;
        fullPrescription = null;
    }

    async function handleAction(
        action: () => Promise<void>,
        errorMsg: string
    ): Promise<void> {
        submitting  = true;
        submitError = null;
        try {
            await action();
            await consultationRoom.reloadDiagnostic();
            collapseAndReset();
        } catch (err) {
            submitError = err instanceof Error ? err.message : errorMsg;
        } finally {
            submitting = false;
        }
    }

    const handleSign       = () => handleAction(
        () => prescriptionApi.signPrescription(prescription!.prescriptionCode),
        'Error al firmar la receta.'
    );
    const handleSuspend    = () => handleAction(
        () => prescriptionApi.suspendPrescription(prescription!.prescriptionCode),
        'Error al suspender la receta.'
    );
    const handleReactivate = () => handleAction(
        () => prescriptionApi.reactivatePrescription(prescription!.prescriptionCode),
        'Error al reactivar la receta.'
    );
    const handleCancel     = async () => {
        await handleAction(
            () => prescriptionApi.cancelPrescription(prescription!.prescriptionCode),
            'Error al cancelar la receta.'
        );
        confirmCancel = false;
    };

    async function handleRxFormClose(): Promise<void> {
        rxFormOpen = false;
        await consultationRoom.reloadDiagnostic();
        collapseAndReset();
    }

    function statusBadgeCls(status: string): string {
        switch (status) {
            case 'Borrador':   return 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300';
            case 'Activo':     return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
            case 'Suspendido': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
            case 'Cancelado':  return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
            case 'Dispensado': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
            case 'Finalizado': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
            case 'Caducado':   return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
            default:           return 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300';
        }
    }

    function fmtDate(s: string): string {
        return new Date(s.length === 10 ? s + 'T00:00:00' : s)
            .toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    const btnSecondary = [
        'cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium',
        'text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-50'
    ].join(' ');
</script>

<div class="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
    <div class="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-stone-700">
        <h2 class="text-sm font-semibold text-stone-900 dark:text-stone-50">Receta</h2>
        {#if !prescription && !isReadOnly}
            <button
                type="button"
                onclick={() => (rxFormOpen = true)}
                disabled={submitting}
                class="cursor-pointer rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-medium text-white
                       transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50
                       dark:bg-teal-600 dark:hover:bg-teal-700"
            >
                Agregar receta
            </button>
        {/if}
    </div>

    <div class="p-5">
        {#if !prescription}
            <p class="text-sm text-stone-500 dark:text-stone-400">
                {isReadOnly ? 'No se registró receta para esta consulta.' : 'Aún no hay receta. Cree una para continuar.'}
            </p>
        {:else}
            <!-- Summary row -->
            <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold {statusBadgeCls(prescription.statusName)}">
                    {prescription.statusName}
                </span>
                <span class="text-xs text-stone-500 dark:text-stone-400">
                    Vigente hasta {fmtDate(prescription.validUntil)}
                </span>
                <span class="text-xs text-stone-400 dark:text-stone-500">
                    · {prescription.detailCount} medicamento{prescription.detailCount !== 1 ? 's' : ''}
                </span>

                <div class="ml-auto flex items-center gap-1">
                    {#if canSign}
                        <button
                            type="button"
                            onclick={handleSign}
                            disabled={submitting}
                            class="flex cursor-pointer items-center gap-1 rounded-lg bg-teal-500 px-3 py-1.5
                                   text-xs font-medium text-white transition-colors hover:bg-teal-600
                                   disabled:cursor-not-allowed disabled:opacity-50
                                   dark:bg-teal-600 dark:hover:bg-teal-700"
                        >
                            Firmar
                        </button>
                    {/if}
                    {#if canEdit}
                        <button
                            type="button"
                            onclick={async () => {
                                if (!fullPrescription) {
                                    loadingFull = true;
                                    try {
                                        fullPrescription = await prescriptionApi.getPrescription(prescription!.prescriptionCode);
                                    } finally {
                                        loadingFull = false;
                                    }
                                }
                                rxFormOpen = true;
                            }}
                            disabled={submitting || loadingFull}
                            class="{btnSecondary} flex items-center gap-1"
                        >
                            Editar
                        </button>
                    {/if}
                    {#if canSuspend}
                        <button type="button" onclick={handleSuspend} disabled={submitting} class={btnSecondary}>
                            Suspender
                        </button>
                    {/if}
                    {#if canReactivate}
                        <button type="button" onclick={handleReactivate} disabled={submitting} class={btnSecondary}>
                            Reactivar
                        </button>
                    {/if}
                    {#if canCancel}
                        <button
                            type="button"
                            onclick={() => (confirmCancel = true)}
                            disabled={submitting}
                            class="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs
                                   font-medium text-rose-600 transition-colors hover:bg-rose-50
                                   disabled:cursor-not-allowed disabled:opacity-50
                                   dark:border-stone-700 dark:text-rose-400 dark:hover:bg-rose-900/30"
                        >
                            Cancelar
                        </button>
                    {/if}

                    <!-- Expand toggle -->
                    <button
                        type="button"
                        onclick={toggleExpand}
                        disabled={loadingFull}
                        aria-label={expanded ? 'Ocultar detalles' : 'Ver detalles'}
                        class="cursor-pointer rounded p-1 text-stone-400 transition-colors hover:bg-stone-100
                               hover:text-stone-600 disabled:cursor-not-allowed disabled:opacity-50
                               dark:hover:bg-stone-700 dark:hover:text-stone-300"
                    >
                        {#if loadingFull}
                            <span
                                class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-300
                                       border-t-teal-500 dark:border-stone-600 dark:border-t-teal-400"
                                aria-hidden="true"
                            ></span>
                        {:else}
                            <IconChevronDown
                                size={16}
                                aria-hidden="true"
                                class="transition-transform duration-200 {expanded ? 'rotate-180' : ''}"
                            />
                        {/if}
                    </button>
                </div>
            </div>

            {#if submitError}
                <p class="mt-2 text-xs text-rose-600 dark:text-rose-400">{submitError}</p>
            {/if}

            {#if loadError}
                <p class="mt-2 text-xs text-rose-600 dark:text-rose-400">{loadError}</p>
            {/if}

            <!-- Expanded details -->
            {#if expanded && fullPrescription}
                <div class="mt-4 border-t border-stone-200 pt-4 dark:border-stone-700">
                    {#if fullPrescription.notes}
                        <p class="mb-3 text-xs text-stone-500 dark:text-stone-400">
                            <span class="font-medium">Notas:</span> {fullPrescription.notes}
                        </p>
                    {/if}
                    <div class="space-y-2">
                        {#each fullPrescription.details as d (d.prescriptionDetailCode)}
                            <div class="rounded-md bg-stone-50 px-3 py-2.5 dark:bg-stone-700/50">
                                <div class="flex flex-wrap items-start justify-between gap-1">
                                    <span class="text-sm font-medium text-stone-800 dark:text-stone-100">
                                        {d.medicationName}
                                    </span>
                                    <span class="text-xs text-stone-500 dark:text-stone-400">{d.dose}</span>
                                </div>
                                <div class="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-stone-500 dark:text-stone-400">
                                    <span>{d.frequencyDescription}</span>
                                    <span>{d.administrationRouteName}</span>
                                    <span>{d.durationDays} día{d.durationDays !== 1 ? 's' : ''}</span>
                                </div>
                                {#if d.instructions}
                                    <p class="mt-0.5 text-xs italic text-stone-400 dark:text-stone-500">{d.instructions}</p>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</div>

<!-- Create / Edit prescription form -->
{#if rxFormOpen}
    {#key prescription?.prescriptionCode ?? 'new'}
        <PrescriptionForm
            open={true}
            prescription={fullPrescription}
            diagnosticCode={diagnostic.diagnosticCode}
            onclose={handleRxFormClose}
        />
    {/key}
{/if}

<!-- Cancel confirmation -->
{#if confirmCancel}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="alertdialog"
        aria-labelledby="rx-cancel-title"
        aria-describedby="rx-cancel-desc"
    >
        <div class="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">
            <div class="px-6 py-5">
                <div class="mb-3 flex items-center gap-2">
                    <IconAlertTriangle size={20} class="shrink-0 text-rose-500" aria-hidden="true" />
                    <h3 id="rx-cancel-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                        Cancelar receta
                    </h3>
                </div>
                <p id="rx-cancel-desc" class="text-sm text-stone-600 dark:text-stone-400">
                    Esta acción es <strong class="font-medium text-stone-900 dark:text-stone-100">irreversible</strong>.
                    La receta quedará cancelada definitivamente.
                </p>
                {#if submitError}
                    <div class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                               text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                        {submitError}
                    </div>
                {/if}
            </div>
            <div class="flex justify-end gap-3 border-t border-stone-200 px-6 py-4 dark:border-stone-700">
                <button
                    type="button"
                    onclick={() => { confirmCancel = false; submitError = null; }}
                    disabled={submitting}
                    class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium
                           text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:border-stone-700 dark:text-stone-400
                           dark:hover:bg-stone-700 dark:hover:text-stone-50"
                >
                    No, volver
                </button>
                <button
                    type="button"
                    onclick={handleCancel}
                    disabled={submitting}
                    class="cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium
                           text-white transition-colors hover:bg-rose-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-rose-600 dark:hover:bg-rose-700"
                >
                    {submitting ? 'Cancelando…' : 'Sí, cancelar'}
                </button>
            </div>
        </div>
    </div>
{/if}
