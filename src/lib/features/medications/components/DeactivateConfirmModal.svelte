<!-- src/lib/features/medications/components/DeactivateConfirmModal.svelte -->
<script lang="ts">
    interface Props {
        open: boolean;
        medicationName: string;
        submitting: boolean;
        error: string | null;
        onconfirm: () => void;
        oncancel: () => void;
    }
    let { open, medicationName, submitting, error, onconfirm, oncancel }: Props = $props();
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="alertdialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
    >
        <div class="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">

            <div class="px-6 py-5">
                <h2 id="confirm-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    Desactivar medicamento
                </h2>
                <p id="confirm-desc" class="mt-2 text-sm text-stone-600 dark:text-stone-400">
                    ¿Desea desactivar
                    <strong class="font-medium text-stone-900 dark:text-stone-100">{medicationName}</strong>?
                    El registro se conserva y puede reactivarse más adelante.
                </p>

                {#if error}
                    <div class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
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
                    onclick={onconfirm}
                    disabled={submitting}
                    class="cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium
                           text-white transition-colors
                           hover:bg-rose-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-rose-600 dark:hover:bg-rose-700"
                >
                    {submitting ? 'Desactivando…' : 'Desactivar'}
                </button>
            </div>

        </div>
    </div>
{/if}
