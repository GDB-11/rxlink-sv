<!-- src/lib/features/privacy-notice/components/PublishPrivacyNoticeModal.svelte -->
<!-- Mounted fresh each time it opens via {#if} in the page, so the fields start empty. -->
<script lang="ts">
    import type { PublishPrivacyNoticeBody } from '$lib/api/privacyApi';
    import ModalDialog from '$lib/components/ui/ModalDialog.svelte';
    import TextInput from '$lib/components/ui/TextInput.svelte';
    import TextArea from '$lib/components/ui/TextArea.svelte';
    import DatePicker from '$lib/components/ui/DatePicker.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import { todayIso } from '$lib/utils/date';

    interface Props {
        submitting: boolean;
        submitError: string | null;
        onsubmit: (body: PublishPrivacyNoticeBody) => void;
        onclose: () => void;
    }
    let { submitting, submitError, onsubmit, onclose }: Props = $props();

    let title         = $state('Aviso de privacidad');
    let body          = $state('');
    let effectiveFrom = $state(todayIso());
    let validation    = $state<string | null>(null);

    function handleSubmit(e: SubmitEvent): void {
        e.preventDefault();
        if (submitting) return;

        if (!title.trim() || body.trim().length < 20) {
            validation = 'Indique el título y el texto del aviso (mínimo 20 caracteres).';
            return;
        }
        if (!effectiveFrom) {
            validation = 'Indique desde cuándo rige esta versión.';
            return;
        }

        validation = null;
        onsubmit({ Title: title.trim(), Body: body.trim(), EffectiveFrom: effectiveFrom });
    }
</script>

<ModalDialog open={true} title="Publicar nueva versión" widthClass="max-w-2xl" {onclose}>
    <form id="privacy-notice-form" onsubmit={handleSubmit} class="space-y-4" novalidate>
        <p class="text-xs text-stone-500 dark:text-stone-400">
            Una versión publicada no se puede editar. Para corregirla, publique una nueva: los pacientes deberán
            confirmarla otra vez.
        </p>

        <div class="space-y-1.5">
            <label for="notice-title" class="block text-sm font-medium text-stone-700 dark:text-stone-300">Título</label>
            <TextInput id="notice-title" bind:value={title} maxLength={200} disabled={submitting} />
        </div>

        <div class="space-y-1.5">
            <label for="notice-effective" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Vigente desde
            </label>
            <DatePicker id="notice-effective" bind:value={effectiveFrom} minDate={todayIso()} disabled={submitting} />
        </div>

        <div class="space-y-1.5">
            <label for="notice-body" class="block text-sm font-medium text-stone-700 dark:text-stone-300">Texto</label>
            <TextArea id="notice-body" bind:value={body} rows={12} maxLength={50000} disabled={submitting} />
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
            form="privacy-notice-form"
            disabled={submitting}
            class="cursor-pointer rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white
                   hover:bg-teal-600 disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
            {submitting ? 'Publicando…' : 'Publicar'}
        </button>
    {/snippet}
</ModalDialog>
