<!-- src/lib/features/nurse/components/DispenseConfirmModal.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { prescriptionApi, type PrescriptionDetailResponse } from '$lib/api/prescriptionApi';
    import { medicalProfile } from '$lib/features/medical-profile/stores/medicalProfile.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import DispenseQuantityFields from './DispenseQuantityFields.svelte';
    import StockOverrideReason from './StockOverrideReason.svelte';

    interface Props {
        open:             boolean;
        prescriptionCode: string;
        patientName?:     string;
        onclose:          () => void;
        /** Called after a successful dispensation, before `onclose`. */
        ondispensed?:     () => void;
    }
    let { open, prescriptionCode, patientName = '', onclose, ondispensed }: Props = $props();

    let details    = $state<PrescriptionDetailResponse[]>([]);
    let quantities = $state<Record<string, number | null>>({});
    let loading    = $state(true);
    let loadError  = $state<string | null>(null);
    let overrideReason = $state('');

    // Suggestion only: one unit per dose over the whole treatment.
    function suggestedQuantity(d: PrescriptionDetailResponse): number {
        return Math.max(1, Math.ceil((24 / d.frequencyIntervalHours) * d.durationDays));
    }

    onMount(async () => {
        try {
            const resp = await prescriptionApi.getPrescription(prescriptionCode);
            details    = resp.details;
            quantities = Object.fromEntries(resp.details.map((d) => [d.prescriptionDetailCode, suggestedQuantity(d)]));
        } catch (err) {
            loadError = err instanceof Error ? err.message : 'Error al cargar la receta.';
        } finally {
            loading = false;
        }
    });

    const items = $derived(
        details.map((d) => ({
            prescriptionDetailCode: d.prescriptionDetailCode,
            quantity:               quantities[d.prescriptionDetailCode] ?? 0
        }))
    );
    const needsOverride = $derived(medicalProfile.insufficientStock);
    const canConfirm = $derived(
        !loading && !loadError && items.length > 0 && items.every((i) => i.quantity > 0) && !medicalProfile.submitting
            && (!needsOverride || overrideReason.trim().length > 0)
    );

    async function handleConfirm(): Promise<void> {
        const ok = await medicalProfile.dispensePrescription(
            prescriptionCode, items, needsOverride ? overrideReason.trim() : undefined
        );
        if (ok) {
            ondispensed?.();
            onclose();
        }
    }

    function handleCancel(): void {
        medicalProfile.clearSubmitError();
        onclose();
    }
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="alertdialog"
        aria-labelledby="dispense-modal-title"
        aria-describedby="dispense-modal-desc"
    >
        <div class="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">
            <div class="px-6 py-5">
                <h3 id="dispense-modal-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    Confirmar dispensación
                </h3>
                <p id="dispense-modal-desc" class="mt-2 text-sm text-stone-600 dark:text-stone-400">
                    {#if patientName}
                        Indica la cantidad que se entrega a
                        <strong class="font-medium text-stone-900 dark:text-stone-100">{patientName}</strong>.
                    {:else}
                        Indica la cantidad que se entrega de cada medicamento.
                    {/if}
                    Se descontará del stock.
                </p>

                {#if loading}
                    <p class="mt-4 text-sm text-stone-500 dark:text-stone-400">Cargando receta…</p>
                {:else}
                    <DispenseQuantityFields {details} bind:quantities disabled={medicalProfile.submitting} />
                {/if}

                {#if needsOverride}
                    <StockOverrideReason bind:reason={overrideReason} disabled={medicalProfile.submitting} />
                {/if}

                <p class="mt-4 text-sm text-stone-500 dark:text-stone-400">Esta acción no se puede deshacer.</p>

                {#if !needsOverride}
                    <div class="mt-3">
                        <ErrorAlert message={loadError ?? medicalProfile.submitError} />
                    </div>
                {/if}
            </div>

            <div class="flex justify-end gap-3 border-t border-stone-200 px-6 py-4 dark:border-stone-700">
                <button
                    type="button"
                    onclick={handleCancel}
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
                    onclick={handleConfirm}
                    disabled={!canConfirm}
                    class="cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium
                           text-white transition-colors hover:bg-blue-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                    {medicalProfile.submitting ? 'Procesando...' : needsOverride ? 'Dispensar con faltante' : 'Confirmar dispensación'}
                </button>
            </div>
        </div>
    </div>
{/if}
