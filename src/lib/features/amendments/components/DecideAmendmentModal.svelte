<!-- src/lib/features/amendments/components/DecideAmendmentModal.svelte -->
<!-- Mounted per target via {#key} in the page, so the fields start empty each time. -->
<script lang="ts">
    import type { AmendmentResponse, DecideAmendmentBody } from '$lib/api/privacyApi';
    import ModalDialog from '$lib/components/ui/ModalDialog.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import { targetAreaLabel } from '../labels';

    interface Props {
        amendment: AmendmentResponse | null;
        submitting: boolean;
        submitError: string | null;
        onsubmit: (body: DecideAmendmentBody) => void;
        onclose: () => void;
    }
    let { amendment, submitting, submitError, onsubmit, onclose }: Props = $props();

    let accepted      = $state(true);
    let reason        = $state('');
    let amendmentText = $state('');
    let validation    = $state<string | null>(null);

    const textareaClass = `w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900
        focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none
        disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50`;

    function handleSubmit(e: SubmitEvent): void {
        e.preventDefault();
        if (submitting) return;
        if (reason.trim().length < 5) {
            validation = 'Indique el motivo de la decisión (mínimo 5 caracteres).';
            return;
        }
        if (accepted && amendmentText.trim() === '') {
            validation = 'Para aceptar, indique el texto que se agregará a la historia.';
            return;
        }
        validation = null;
        onsubmit({
            Accepted: accepted,
            Reason: reason.trim(),
            AmendmentText: accepted ? amendmentText.trim() : null
        });
    }
</script>

<ModalDialog open={amendment !== null} title="Resolver solicitud de enmienda" widthClass="max-w-lg" {onclose}>
    {#if amendment}
        <form id="decide-amendment-form" onsubmit={handleSubmit} class="space-y-4" novalidate>
            <div class="rounded-lg bg-stone-50 p-3 text-sm dark:bg-stone-900">
                <p class="text-xs text-stone-500 dark:text-stone-400">
                    {amendment.patientName} · {targetAreaLabel(amendment.targetArea)}
                </p>
                <p class="mt-1 whitespace-pre-line text-stone-800 dark:text-stone-200">{amendment.requestedChange}</p>
            </div>

            <p class="text-xs text-stone-500 dark:text-stone-400">
                La historia original no se modifica: si acepta, el texto indicado se agrega junto a ella.
                La decisión es definitiva.
            </p>

            <fieldset class="flex gap-5" disabled={submitting}>
                <legend class="sr-only">Decisión</legend>
                <label class="flex cursor-pointer items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                    <input type="radio" name="decision" checked={accepted} onchange={() => (accepted = true)} />
                    Aceptar
                </label>
                <label class="flex cursor-pointer items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                    <input type="radio" name="decision" checked={!accepted} onchange={() => (accepted = false)} />
                    Denegar
                </label>
            </fieldset>

            {#if accepted}
                <div class="space-y-1.5">
                    <label for="amendment-text" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                        Texto a agregar a la historia
                    </label>
                    <textarea
                        id="amendment-text"
                        bind:value={amendmentText}
                        rows="3"
                        maxlength="2000"
                        disabled={submitting}
                        class={textareaClass}
                    ></textarea>
                </div>
            {/if}

            <div class="space-y-1.5">
                <label for="amendment-reason" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                    Motivo de la decisión
                </label>
                <textarea
                    id="amendment-reason"
                    bind:value={reason}
                    rows="2"
                    maxlength="1000"
                    disabled={submitting}
                    class={textareaClass}
                ></textarea>
            </div>

            <ErrorAlert message={validation ?? submitError} />
        </form>
    {/if}

    {#snippet footer()}
        <button
            type="button"
            onclick={onclose}
            disabled={submitting}
            class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-700
                   hover:bg-stone-50 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-700"
        >
            Cancelar
        </button>
        <button
            type="submit"
            form="decide-amendment-form"
            disabled={submitting}
            class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white
                   hover:bg-teal-600 disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
            {submitting ? 'Guardando…' : 'Confirmar decisión'}
        </button>
    {/snippet}
</ModalDialog>
