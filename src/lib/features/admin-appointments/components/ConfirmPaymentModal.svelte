<!-- src/lib/features/admin-appointments/components/ConfirmPaymentModal.svelte -->
<!-- Resolves a PendientePago appointment's payment: admin picks Seguro/Particular, then confirms. -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { appointmentApi } from '$lib/api/appointmentApi';
    import { lookupsApi, type InsuranceLookupItemResponse } from '$lib/api/lookupsApi';
    import PaymentMethodPicker from '$lib/components/ui/PaymentMethodPicker.svelte';

    interface Props {
        open: boolean;
        appointmentCode: string;
        onConfirmed: () => void;
        oncancel: () => void;
    }
    let { open, appointmentCode, onConfirmed, oncancel }: Props = $props();

    let insurances = $state<InsuranceLookupItemResponse[]>([]);
    let paymentMode = $state<'insurance' | 'particular' | 'later'>('particular');
    let insuranceCode = $state<string | null>(null);
    let submitting = $state(false);
    let error = $state<string | null>(null);

    onMount(async () => {
        try {
            const lookups = await lookupsApi.getAppointmentLookups();
            insurances = lookups.insurances;
        } catch {
            insurances = [];
        }
    });

    async function confirm(): Promise<void> {
        submitting = true;
        error = null;
        try {
            await appointmentApi.adminConfirmPayment(
                appointmentCode,
                paymentMode === 'insurance' ? insuranceCode : null
            );
            onConfirmed();
        } catch (err) {
            error = err instanceof Error ? err.message : 'Error al confirmar el pago.';
        } finally {
            submitting = false;
        }
    }
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="confirm-payment-title"
    >
        <div class="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">

            <div class="border-b border-stone-200 px-6 py-4 dark:border-stone-700">
                <h2 id="confirm-payment-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    Confirmar pago
                </h2>
            </div>

            <div class="space-y-4 px-6 py-5">
                <PaymentMethodPicker
                    {insurances}
                    basePrice={null}
                    mode="resolve"
                    bind:paymentMode
                    bind:insuranceCode
                    disabled={submitting}
                />

                {#if error}
                    <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                               text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                        {error}
                    </div>
                {/if}
            </div>

            <div class="flex justify-end gap-3 border-t border-stone-200 px-6 py-4 dark:border-stone-700">
                <button
                    type="button"
                    onclick={oncancel}
                    disabled={submitting}
                    class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium
                           text-stone-600 transition-colors
                           hover:bg-stone-50 hover:text-stone-900
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:border-stone-700 dark:text-stone-400
                           dark:hover:bg-stone-700 dark:hover:text-stone-50"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onclick={confirm}
                    disabled={submitting || (paymentMode === 'insurance' && !insuranceCode)}
                    class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium
                           text-white transition-colors
                           hover:bg-teal-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                    {submitting ? 'Confirmando…' : 'Confirmar'}
                </button>
            </div>

        </div>
    </div>
{/if}
