<!-- src/lib/features/medical-profile/components/ExportPatientRecordButton.svelte -->
<script lang="ts">
    import { IconDownload } from '@tabler/icons-svelte';
    import { patientApi, type PatientResponse } from '$lib/api/patientApi';
    import { ApiError } from '$lib/api/api';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';

    interface Props {
        patient: PatientResponse;
    }
    let { patient }: Props = $props();

    let busy = $state(false);
    let error = $state<string | null>(null);

    async function download(): Promise<void> {
        busy = true;
        error = null;
        try {
            const record = await patientApi.exportRecord(patient.patientCode);
            const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `historia-${patient.medicalRecordNumber}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            error =
                e instanceof ApiError && e.status === 403
                    ? 'No tiene permiso para exportar la historia de este paciente.'
                    : 'No se pudo generar la copia de la historia.';
        } finally {
            busy = false;
        }
    }
</script>

<div class="flex flex-col items-end gap-2">
    <button
        type="button"
        onclick={download}
        disabled={busy}
        class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2
               text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50
               hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-60
               dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-50"
    >
        <IconDownload size={15} aria-hidden="true" />
        {busy ? 'Generando…' : 'Descargar copia'}
    </button>
    {#if error}
        <ErrorAlert message={error} />
    {/if}
</div>
