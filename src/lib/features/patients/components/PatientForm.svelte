<!-- src/lib/features/patients/components/PatientForm.svelte -->
<script lang="ts">
    import type { PatientResponse, CreatePatientBody, UpdatePatientBody } from '$lib/api/patientApi';
    import PatientFormBody from './PatientFormBody.svelte';

    interface Props {
        open: boolean;
        mode: 'create' | 'edit';
        initial: PatientResponse | null;
        submitting: boolean;
        error: string | null;
        onsubmit: (data: CreatePatientBody | UpdatePatientBody) => void;
        oncancel: () => void;
    }
    let { open, mode, initial, submitting, error, onsubmit, oncancel }: Props = $props();
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="patient-form-title"
    >
        <div class="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">

            <div class="border-b border-stone-200 px-6 py-4 dark:border-stone-700">
                <h2 id="patient-form-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    {mode === 'create' ? 'Nuevo paciente' : 'Editar paciente'}
                </h2>
            </div>

            {#key `${mode}-${initial?.patientCode ?? 'new'}`}
                <PatientFormBody
                    {mode}
                    {initial}
                    {submitting}
                    {error}
                    {onsubmit}
                    {oncancel}
                />
            {/key}

        </div>
    </div>
{/if}
