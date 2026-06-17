<!-- src/lib/features/doctor-consultations/components/CompleteConsultationButton.svelte -->
<script lang="ts">
    import { IconCheck } from '@tabler/icons-svelte';
    import { consultationRoom } from '../stores/consultationRoom.svelte';

    interface Props {
        hasDiagnostic: boolean;
        statusName:    string;
    }
    let { hasDiagnostic, statusName }: Props = $props();

    let confirming = $state(false);
    let error      = $state<string | null>(null);

    const canComplete = $derived(statusName === 'Confirmado' && hasDiagnostic);

    async function handleComplete(): Promise<void> {
        error = null;
        const ok = await consultationRoom.complete();
        if (!ok) {
            error = consultationRoom.error;
        } else {
            confirming = false;
        }
    }
</script>

{#if canComplete}
    <div class="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
        {#if !confirming}
            <div class="flex items-center justify-between gap-4">
                <div>
                    <p class="text-sm font-medium text-stone-900 dark:text-stone-50">Finalizar consulta</p>
                    <p class="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                        Marca la cita como completada. Esta acción no puede deshacerse.
                    </p>
                </div>
                <button
                    type="button"
                    onclick={() => (confirming = true)}
                    disabled={consultationRoom.completing}
                    class="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-teal-500 px-4 py-2
                           text-sm font-medium text-white transition-colors hover:bg-teal-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                    <IconCheck size={16} aria-hidden="true" />
                    Completar consulta
                </button>
            </div>
        {:else}
            <p class="text-sm font-medium text-stone-900 dark:text-stone-50">
                ¿Confirmar que la consulta ha finalizado?
            </p>
            <p class="mt-1 text-xs text-stone-500 dark:text-stone-400">
                El estado de la cita pasará a <strong>Completado</strong> de forma permanente.
            </p>
            {#if error}
                <div class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                            text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                    {error}
                </div>
            {/if}
            <div class="mt-4 flex justify-end gap-3">
                <button
                    type="button"
                    onclick={() => { confirming = false; error = null; }}
                    disabled={consultationRoom.completing}
                    class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium
                           text-stone-600 transition-colors hover:bg-stone-50
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onclick={handleComplete}
                    disabled={consultationRoom.completing}
                    class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white
                           transition-colors hover:bg-teal-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                    {consultationRoom.completing ? 'Completando…' : 'Sí, completar'}
                </button>
            </div>
        {/if}
    </div>
{/if}
