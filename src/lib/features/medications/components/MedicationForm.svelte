<!-- src/lib/features/medications/components/MedicationForm.svelte -->
<script lang="ts">
    import type { MedicationResponse, MedicationRequestBody } from '$lib/api/medicationApi';
    import type { LookupItem } from '../stores/medications.svelte';
    import MedicationFormBody from './MedicationFormBody.svelte';

    interface Props {
        open: boolean;
        mode: 'create' | 'edit';
        initial: MedicationResponse | null;
        knownForms: LookupItem[];
        knownRoutes: LookupItem[];
        submitting: boolean;
        error: string | null;
        onsubmit: (data: MedicationRequestBody) => void;
        oncancel: () => void;
    }
    let {
        open,
        mode,
        initial,
        knownForms,
        knownRoutes,
        submitting,
        error,
        onsubmit,
        oncancel
    }: Props = $props();
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="med-form-title"
    >
        <div class="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">

            <!-- Header -->
            <div class="border-b border-stone-200 px-6 py-4 dark:border-stone-700">
                <h2 id="med-form-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    {mode === 'create' ? 'Nuevo medicamento' : 'Editar medicamento'}
                </h2>
            </div>

            <!-- {#key} remounts MedicationFormBody on every open so fields initialise fresh from props -->
            {#key `${mode}-${initial?.medicationCode ?? 'new'}`}
                <MedicationFormBody
                    {mode}
                    {initial}
                    {knownForms}
                    {knownRoutes}
                    {submitting}
                    {error}
                    {onsubmit}
                    {oncancel}
                />
            {/key}

        </div>
    </div>
{/if}
