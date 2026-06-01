<!-- src/lib/features/patients/components/ActivatePatientModal.svelte -->
<script lang="ts">
    interface Props {
        open: boolean;
        patientName: string;
        submitting: boolean;
        error: string | null;
        onconfirm: () => void;
        oncancel: () => void;
    }
    let { open, patientName, submitting, error, onconfirm, oncancel }: Props = $props();
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="activate-patient-title"
    >
        <div class="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">
            <div class="border-b border-stone-200 px-6 py-4 dark:border-stone-700">
                <h2 id="activate-patient-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    Activar paciente
                </h2>
            </div>
            <div class="px-6 py-5">
                {#if error}
                    <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                               text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                        {error}
                    </div>
                {/if}
                <p class="text-sm text-stone-600 dark:text-stone-400">
                    ¿Reactivar a <strong class="text-stone-900 dark:text-stone-50">{patientName}</strong>?
                </p>
            </div>
            <div class="flex justify-end gap-3 border-t border-stone-200 px-6 py-4 dark:border-stone-700">
                <button
                    type="button"
                    onclick={oncancel}
                    disabled={submitting}
                    class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium
                           text-stone-600 transition-colors hover:bg-stone-50
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onclick={onconfirm}
                    disabled={submitting}
                    class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white
                           transition-colors hover:bg-teal-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                    {submitting ? 'Activando…' : 'Activar'}
                </button>
            </div>
        </div>
    </div>
{/if}
