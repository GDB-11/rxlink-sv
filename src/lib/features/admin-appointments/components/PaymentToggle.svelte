<!-- src/lib/features/admin-appointments/components/PaymentToggle.svelte -->
<script lang="ts">
    import { appointmentApi } from '$lib/api/appointmentApi';
    import ConfirmPaymentModal from './ConfirmPaymentModal.svelte';

    interface Props {
        appointmentCode: string;
        statusName:      string;
        onToggled:       () => void;
    }
    let { appointmentCode, statusName, onToggled }: Props = $props();

    let loading   = $state(false);
    let error     = $state<string | null>(null);
    let modalOpen = $state(false);

    const isPendiente  = $derived(statusName === 'PendientePago');
    const isConfirmado = $derived(statusName === 'Confirmado');

    async function revert(): Promise<void> {
        loading = true;
        error   = null;
        try {
            await appointmentApi.adminRevertPayment(appointmentCode);
            onToggled();
        } catch (err) {
            error = err instanceof Error ? err.message : 'Error al actualizar el pago.';
        } finally {
            loading = false;
        }
    }

    function handleConfirmed(): void {
        modalOpen = false;
        onToggled();
    }
</script>

<ConfirmPaymentModal
    open={modalOpen}
    {appointmentCode}
    onConfirmed={handleConfirmed}
    oncancel={() => (modalOpen = false)}
/>

{#if isPendiente || isConfirmado}
    <div class="flex flex-col items-end gap-1">
        <button
            type="button"
            onclick={() => (isPendiente ? (modalOpen = true) : revert())}
            disabled={loading}
            class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
                   disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer
                   {isPendiente
                       ? 'bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700'
                       : 'border border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20'}"
        >
            {#if loading}
                <svg class="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
            {/if}
            {isPendiente ? 'Marcar pagado' : 'Marcar sin pago'}
        </button>
        {#if error}
            <p class="text-xs text-rose-600 dark:text-rose-400">{error}</p>
        {/if}
    </div>
{/if}
