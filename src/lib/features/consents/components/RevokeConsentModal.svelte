<!-- src/lib/features/consents/components/RevokeConsentModal.svelte -->
<!-- Mounted fresh per target via {#key} in the section, so the reason starts empty. -->
<script lang="ts">
    import type { ConsentResponse } from '$lib/api/privacyApi';
    import ModalDialog from '$lib/components/ui/ModalDialog.svelte';
    import TextArea from '$lib/components/ui/TextArea.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import { consentTypeLabel } from '../labels';

    interface Props {
        consent: ConsentResponse | null;
        submitting: boolean;
        submitError: string | null;
        onsubmit: (reason: string) => void;
        onclose: () => void;
    }
    let { consent, submitting, submitError, onsubmit, onclose }: Props = $props();

    let reason     = $state('');
    let validation = $state<string | null>(null);

    function handleSubmit(e: SubmitEvent): void {
        e.preventDefault();
        if (submitting) return;
        if (reason.trim().length < 5) {
            validation = 'Indique el motivo de la revocación (mínimo 5 caracteres).';
            return;
        }
        validation = null;
        onsubmit(reason.trim());
    }
</script>

<ModalDialog open={consent !== null} title="Revocar consentimiento" {onclose}>
    <form id="revoke-consent-form" onsubmit={handleSubmit} class="space-y-4" novalidate>
        {#if consent}
            <p class="text-sm text-stone-700 dark:text-stone-300">
                Se revocará el consentimiento de <span class="font-medium">{consentTypeLabel(consent.consentType)}</span>.
                El registro se conserva marcado como revocado y no se puede deshacer.
            </p>
        {/if}

        <div class="space-y-1.5">
            <label for="revoke-reason" class="block text-sm font-medium text-stone-700 dark:text-stone-300">Motivo</label>
            <TextArea id="revoke-reason" bind:value={reason} rows={2} maxLength={500} disabled={submitting} />
        </div>

        <ErrorAlert message={validation ?? submitError} />
    </form>

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
            form="revoke-consent-form"
            disabled={submitting}
            class="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white
                   hover:bg-red-700 disabled:opacity-60"
        >
            {submitting ? 'Guardando…' : 'Revocar'}
        </button>
    {/snippet}
</ModalDialog>
