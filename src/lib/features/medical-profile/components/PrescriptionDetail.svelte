<!-- src/lib/features/medical-profile/components/PrescriptionDetail.svelte -->
<!-- Shows prescription summary + expandable detail panel + action buttons. -->
<script lang="ts">
    import { IconChevronDown, IconPencil, IconCheck, IconX, IconAlertTriangle } from '@tabler/icons-svelte';
    import { prescriptionApi, type PrescriptionResponse } from '$lib/api/prescriptionApi';
    import { medicalProfile } from '../stores/medicalProfile.svelte';
    import type { PrescriptionSummaryResponse } from '$lib/api/diagnosticApi';
    import PrescriptionForm from './PrescriptionForm.svelte';

    interface Props {
        prescription:   PrescriptionSummaryResponse;
        diagnosticCode: string;
        isDoctor:       boolean;
        isNurse:        boolean;
    }
    let { prescription, diagnosticCode, isDoctor, isNurse }: Props = $props();

    let expanded        = $state(false);
    let fullPrescription = $state<PrescriptionResponse | null>(null);
    let loadingFull     = $state(false);
    let loadError       = $state<string | null>(null);
    let editOpen        = $state(false);
    let confirmCancel   = $state(false);
    let confirmDispense = $state(false);

    const canSign       = $derived(prescription.statusName === 'Borrador' && isDoctor);
    const canEdit       = $derived(prescription.statusName === 'Borrador' && isDoctor);
    const canSuspend    = $derived(prescription.statusName === 'Activo' && isDoctor);
    const canReactivate = $derived(prescription.statusName === 'Suspendido' && isDoctor);
    const canCancel     = $derived(
        ['Borrador', 'Activo', 'Suspendido'].includes(prescription.statusName) && isDoctor
    );
    const canDispense   = $derived(prescription.statusName === 'Activo' && isNurse);

    async function toggleExpand(): Promise<void> {
        if (expanded) { expanded = false; return; }
        if (fullPrescription) { expanded = true; return; }
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

    async function handleSign(): Promise<void> {
        const ok = await medicalProfile.signPrescription(prescription.prescriptionCode);
        if (ok) collapseAndReset();
    }

    async function handleSuspend(): Promise<void> {
        const ok = await medicalProfile.suspendPrescription(prescription.prescriptionCode);
        if (ok) collapseAndReset();
    }

    async function handleReactivate(): Promise<void> {
        const ok = await medicalProfile.reactivatePrescription(prescription.prescriptionCode);
        if (ok) collapseAndReset();
    }

    async function handleCancel(): Promise<void> {
        const ok = await medicalProfile.cancelPrescription(prescription.prescriptionCode);
        if (ok) { confirmCancel = false; collapseAndReset(); }
    }

    async function handleDispense(): Promise<void> {
        const ok = await medicalProfile.dispensePrescription(prescription.prescriptionCode);
        if (ok) { confirmDispense = false; collapseAndReset(); }
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

<div class="mt-3 rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800/80">

    <!-- Summary row -->
    <div class="flex flex-wrap items-center gap-2 px-4 py-3">
        <span class="shrink-0 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
            Receta
        </span>
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
            <!-- Action buttons -->
            {#if canSign}
                <button
                    type="button"
                    onclick={handleSign}
                    disabled={medicalProfile.submitting}
                    class="flex cursor-pointer items-center gap-1 rounded-lg bg-teal-500 px-3 py-1.5
                           text-xs font-medium text-white transition-colors hover:bg-teal-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                    <IconCheck size={12} aria-hidden="true" />
                    Firmar
                </button>
            {/if}
            {#if canEdit}
                <button
                    type="button"
                    onclick={() => (editOpen = true)}
                    disabled={medicalProfile.submitting}
                    class="{btnSecondary} flex items-center gap-1"
                >
                    <IconPencil size={12} aria-hidden="true" />
                    Editar
                </button>
            {/if}
            {#if canSuspend}
                <button
                    type="button"
                    onclick={handleSuspend}
                    disabled={medicalProfile.submitting}
                    class={btnSecondary}
                >
                    Suspender
                </button>
            {/if}
            {#if canReactivate}
                <button
                    type="button"
                    onclick={handleReactivate}
                    disabled={medicalProfile.submitting}
                    class={btnSecondary}
                >
                    Reactivar
                </button>
            {/if}
            {#if canCancel}
                <button
                    type="button"
                    onclick={() => (confirmCancel = true)}
                    disabled={medicalProfile.submitting}
                    class="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs
                           font-medium text-rose-600 transition-colors hover:bg-rose-50
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:border-stone-700 dark:text-rose-400 dark:hover:bg-rose-900/30"
                >
                    Cancelar
                </button>
            {/if}
            {#if canDispense}
                <button
                    type="button"
                    onclick={() => (confirmDispense = true)}
                    disabled={medicalProfile.submitting}
                    class="cursor-pointer rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium
                           text-white transition-colors hover:bg-blue-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                    Dispensar
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

    <!-- Error state -->
    {#if loadError}
        <div class="border-t border-stone-200 px-4 py-3 text-sm text-rose-600 dark:border-stone-700 dark:text-rose-400">
            {loadError}
        </div>
    {/if}

    <!-- Store-level submit error (for actions) -->
    {#if medicalProfile.submitError && !confirmCancel && !confirmDispense && !editOpen}
        <div class="border-t border-stone-200 px-4 py-3 text-sm text-rose-600
                    dark:border-stone-700 dark:text-rose-400">
            {medicalProfile.submitError}
        </div>
    {/if}

    <!-- Expanded detail -->
    {#if expanded && fullPrescription}
        <div class="border-t border-stone-200 px-4 py-4 dark:border-stone-700">
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

</div>

<!-- Edit form (Borrador only) -->
{#if editOpen && fullPrescription}
    {#key fullPrescription.prescriptionCode}
        <PrescriptionForm
            open={true}
            prescription={fullPrescription}
            {diagnosticCode}
            onclose={() => { editOpen = false; collapseAndReset(); }}
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
                    onclick={() => { confirmCancel = false; medicalProfile.clearSubmitError(); }}
                    disabled={medicalProfile.submitting}
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
                    disabled={medicalProfile.submitting}
                    class="cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium
                           text-white transition-colors hover:bg-rose-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-rose-600 dark:hover:bg-rose-700"
                >
                    {medicalProfile.submitting ? 'Cancelando…' : 'Sí, cancelar'}
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Dispense confirmation -->
{#if confirmDispense}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="alertdialog"
        aria-labelledby="rx-dispense-title"
        aria-describedby="rx-dispense-desc"
    >
        <div class="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">
            <div class="px-6 py-5">
                <h3 id="rx-dispense-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    Confirmar dispensación
                </h3>
                <p id="rx-dispense-desc" class="mt-2 text-sm text-stone-600 dark:text-stone-400">
                    ¿Confirma la dispensación de esta receta? El estado pasará a
                    <strong class="font-medium text-stone-900 dark:text-stone-100">Dispensado</strong>.
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
                    onclick={() => { confirmDispense = false; medicalProfile.clearSubmitError(); }}
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
                    onclick={handleDispense}
                    disabled={medicalProfile.submitting}
                    class="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium
                           text-white transition-colors hover:bg-blue-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                    {medicalProfile.submitting ? 'Dispensando…' : 'Confirmar'}
                </button>
            </div>
        </div>
    </div>
{/if}
