<!-- src/lib/features/medical-profile/components/SignPrescriptionModal.svelte -->
<!-- Runs the allergy / interaction check and asks the doctor to confirm before signing. -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { prescriptionApi, type PrescriptionSafetyWarning } from '$lib/api/prescriptionApi';
    import { medicalProfile } from '../stores/medicalProfile.svelte';
    import ModalDialog from '$lib/components/ui/ModalDialog.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import PrescriptionSafetyWarningList from './PrescriptionSafetyWarningList.svelte';

    interface Props {
        open:             boolean;
        prescriptionCode: string;
        onclose:          () => void;
        /** Called after the prescription was signed, before `onclose`. */
        onsigned?:        () => void;
    }
    let { open, prescriptionCode, onclose, onsigned }: Props = $props();

    let loading    = $state(true);
    let warnings   = $state<PrescriptionSafetyWarning[]>([]);
    let checkError = $state<string | null>(null);

    onMount(async () => {
        try {
            warnings = (await prescriptionApi.getSafetyCheck(prescriptionCode)).warnings;
        } catch (err) {
            checkError = err instanceof Error ? err.message : 'No se pudo verificar la receta.';
        } finally {
            loading = false;
        }
    });

    // Anything other than a clean check needs an explicit "sign anyway".
    const needsAcknowledgement = $derived(warnings.length > 0 || checkError !== null);

    function handleClose(): void {
        medicalProfile.clearSubmitError();
        onclose();
    }

    async function handleSign(): Promise<void> {
        const ok = await medicalProfile.signPrescription(prescriptionCode);
        if (ok) {
            onsigned?.();
            onclose();
        }
    }
</script>

<ModalDialog {open} title="Firmar receta" widthClass="max-w-lg" onclose={handleClose}>
    {#if loading}
        <p class="text-sm text-stone-500 dark:text-stone-400" role="status">Verificando alergias e interacciones…</p>
    {:else}
        <div class="space-y-3">
            {#if checkError}
                <ErrorAlert message={`No se pudo verificar alergias e interacciones: ${checkError}`} />
            {:else if warnings.length === 0}
                <p class="text-sm text-stone-600 dark:text-stone-300">
                    No se encontraron alergias ni interacciones. Al firmar, la receta quedará activa.
                </p>
            {:else}
                <p class="text-sm text-stone-600 dark:text-stone-300">
                    Revise estas advertencias antes de firmar:
                </p>
                <PrescriptionSafetyWarningList {warnings} />
            {/if}
            <ErrorAlert message={medicalProfile.submitError} />
        </div>
    {/if}

    {#snippet footer()}
        <button
            type="button"
            onclick={handleClose}
            disabled={medicalProfile.submitting}
            class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium
                   text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900
                   disabled:cursor-not-allowed disabled:opacity-50
                   dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-50"
        >
            {needsAcknowledgement ? 'Revisar receta' : 'Cancelar'}
        </button>
        <button
            type="button"
            onclick={handleSign}
            disabled={loading || medicalProfile.submitting}
            class="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors
                   disabled:cursor-not-allowed disabled:opacity-50
                   {needsAcknowledgement
                       ? 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700'
                       : 'bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700'}"
        >
            {#if medicalProfile.submitting}
                Firmando…
            {:else}
                {needsAcknowledgement ? 'Firmar de todos modos' : 'Firmar'}
            {/if}
        </button>
    {/snippet}
</ModalDialog>
