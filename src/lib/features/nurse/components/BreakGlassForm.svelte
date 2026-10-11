<!-- src/lib/features/nurse/components/BreakGlassForm.svelte -->
<script lang="ts">
    import TextInput from '$lib/components/ui/TextInput.svelte';
    import SubmitButton from '$lib/components/ui/SubmitButton.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';

    const MIN_REASON = 10;

    interface Props {
        submitting: boolean;
        error:      string | null;
        onsubmit:   (medicalRecordNumber: string, reason: string) => void;
    }
    let { submitting, error, onsubmit }: Props = $props();

    let medicalRecordNumber = $state('');
    let reason              = $state('');

    const canSubmit = $derived(
        medicalRecordNumber.trim().length > 0 && reason.trim().length >= MIN_REASON
    );

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (canSubmit) onsubmit(medicalRecordNumber.trim(), reason.trim());
    }
</script>

<form onsubmit={handleSubmit} class="space-y-4">
    <div class="space-y-1.5">
        <label for="bg-mrn" class="text-sm font-medium text-stone-700 dark:text-stone-300">
            Número de historia clínica exacto
        </label>
        <TextInput
            id="bg-mrn"
            bind:value={medicalRecordNumber}
            placeholder="PAC-202601-00001"
            maxLength={50}
            disabled={submitting}
        />
    </div>

    <div class="space-y-1.5">
        <label for="bg-reason" class="text-sm font-medium text-stone-700 dark:text-stone-300">
            Motivo del acceso
        </label>
        <textarea
            id="bg-reason"
            bind:value={reason}
            rows="3"
            maxlength="500"
            disabled={submitting}
            placeholder="Describa por qué necesita acceder a este paciente (mín. {MIN_REASON} caracteres)"
            class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900
                   placeholder:text-stone-400 transition-colors
                   focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
                   disabled:cursor-not-allowed disabled:opacity-50
                   dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50 dark:placeholder:text-stone-600"
        ></textarea>
    </div>

    <ErrorAlert message={error} />

    <SubmitButton
        isLoading={submitting}
        disabled={!canSubmit}
        label="Solicitar acceso de emergencia"
        loadingLabel="Registrando…"
    />
</form>
