<!-- src/lib/features/nurse/components/NurseClinicalPage.svelte -->
<script lang="ts">
    import { medicalProfile } from '$lib/features/medical-profile/stores/medicalProfile.svelte';
    import PatientProfileHeader from '$lib/features/medical-profile/components/PatientProfileHeader.svelte';
    import NurseAllergySection from './NurseAllergySection.svelte';
    import NurseDiagnosticsSection from './NurseDiagnosticsSection.svelte';
    import DispenseConfirmModal from './DispenseConfirmModal.svelte';

    interface Props {
        patientCode: string;
    }
    let { patientCode }: Props = $props();

    let dispenseModalOpen        = $state(false);
    let selectedPrescriptionCode = $state('');

    $effect(() => {
        if (patientCode) medicalProfile.load(patientCode);
    });

    function openDispense(code: string): void {
        selectedPrescriptionCode = code;
        dispenseModalOpen        = true;
    }

    function closeDispense(): void {
        dispenseModalOpen        = false;
        selectedPrescriptionCode = '';
    }

    const patientName = $derived(
        medicalProfile.patient
            ? `${medicalProfile.patient.surnames}, ${medicalProfile.patient.names}`
            : ''
    );
</script>

<div class="space-y-6">

    <a
        href="/enfermero"
        class="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors
               hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
    >
        <span aria-hidden="true">←</span>
        Volver a búsqueda
    </a>

    {#if medicalProfile.loading && !medicalProfile.patient}
        <div class="flex items-center justify-center py-20">
            <span
                class="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-teal-500
                       dark:border-stone-700 dark:border-t-teal-400"
                aria-hidden="true"
            ></span>
        </div>

    {:else if medicalProfile.error && !medicalProfile.patient}
        <div class="rounded-xl border border-rose-200 bg-rose-50 px-6 py-5 dark:border-rose-800 dark:bg-rose-900/30">
            <p class="text-sm text-rose-700 dark:text-rose-400">{medicalProfile.error}</p>
            <button
                type="button"
                onclick={() => medicalProfile.load(patientCode)}
                class="mt-3 cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium
                       text-white transition-colors hover:bg-rose-700"
            >
                Reintentar
            </button>
        </div>

    {:else if medicalProfile.patient}
        <PatientProfileHeader patient={medicalProfile.patient} />

        <hr class="border-stone-200 dark:border-stone-700" />

        <NurseAllergySection
            allergies={medicalProfile.patient.allergies}
            submitting={medicalProfile.submitting}
            submitError={medicalProfile.submitError}
        />

        <hr class="border-stone-200 dark:border-stone-700" />

        <NurseDiagnosticsSection
            diagnostics={medicalProfile.diagnostics}
            loading={medicalProfile.loading}
            totalCount={medicalProfile.totalCount}
            page={medicalProfile.page}
            totalPages={medicalProfile.totalPages}
            onpage={(p) => medicalProfile.setPage(p)}
            ondispense={openDispense}
        />
    {/if}

</div>

{#if dispenseModalOpen}
    {#key selectedPrescriptionCode}
        <DispenseConfirmModal
            open={true}
            prescriptionCode={selectedPrescriptionCode}
            {patientName}
            onclose={closeDispense}
        />
    {/key}
{/if}
