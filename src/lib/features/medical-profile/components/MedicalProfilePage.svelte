<!-- src/lib/features/medical-profile/components/MedicalProfilePage.svelte -->
<script lang="ts">
    import { auth } from '$lib/features/auth';
    import { medicalProfile } from '../stores/medicalProfile.svelte';
    import PatientProfileHeader from './PatientProfileHeader.svelte';
    import AllergiesSection from './AllergiesSection.svelte';
    import DiagnosticsSection from './DiagnosticsSection.svelte';

    interface Props {
        patientCode: string;
    }
    let { patientCode }: Props = $props();

    const isDoctor = $derived(auth.roleName === 'Doctor');
    const isNurse  = $derived(auth.roleName === 'Enfermero');

    $effect(() => {
        medicalProfile.load(patientCode);
    });

    function handlePersonUpdated(): void {
        medicalProfile.load(patientCode);
    }
</script>

<div class="space-y-6">

    <!-- Back link -->
    <a
        href="/pacientes"
        class="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors
               hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
    >
        <span aria-hidden="true">←</span>
        Volver a pacientes
    </a>

    <!-- Loading state -->
    {#if medicalProfile.loading && !medicalProfile.patient}
        <div class="flex items-center justify-center py-20">
            <span
                class="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-teal-500
                       dark:border-stone-700 dark:border-t-teal-400"
                aria-hidden="true"
            ></span>
        </div>

    <!-- Error state -->
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

    <!-- Content -->
    {:else if medicalProfile.patient}
        <PatientProfileHeader
            patient={medicalProfile.patient}
            onupdated={handlePersonUpdated}
        />

        <hr class="border-stone-200 dark:border-stone-700" />

        <AllergiesSection
            allergies={medicalProfile.patient.allergies}
            {isDoctor}
        />

        <hr class="border-stone-200 dark:border-stone-700" />

        <DiagnosticsSection
            diagnostics={medicalProfile.diagnostics}
            page={medicalProfile.page}
            totalPages={medicalProfile.totalPages}
            {isDoctor}
            {isNurse}
            appointmentCode={null}
        />
    {/if}

</div>
