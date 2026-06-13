<!-- src/lib/features/medical-profile/components/PatientProfileHeader.svelte -->
<script lang="ts">
    import { IconPencil } from '@tabler/icons-svelte';
    import { auth } from '$lib/features/auth';
    import type { PatientResponse } from '$lib/api/patientApi';
    import type { PersonResponse } from '$lib/api/personApi';
    import PersonEditModal from './PersonEditModal.svelte';

    interface Props {
        patient: PatientResponse;
        onupdated?: (person: PersonResponse) => void;
    }
    let { patient, onupdated }: Props = $props();

    let editOpen = $state(false);

    const isDoctor = $derived(auth.roleName === 'Doctor');

    function calcAge(birthDate: string): number {
        const today = new Date();
        const bd = new Date(birthDate + 'T00:00:00');
        let age = today.getFullYear() - bd.getFullYear();
        const m = today.getMonth() - bd.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
        return age;
    }

    const age = $derived(calcAge(patient.birthDate));

    function handleSaved(updated: PersonResponse): void {
        editOpen = false;
        onupdated?.(updated);
    }
</script>

<div class="rounded-xl border border-stone-200 bg-white px-6 py-5 shadow-sm dark:border-stone-700 dark:bg-stone-800">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
            <h1 class="text-xl font-bold text-stone-900 dark:text-stone-50">
                {patient.names} {patient.surnames}
            </h1>

            <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500 dark:text-stone-400">
                <span class="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold
                             text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                    HC-{patient.medicalRecordNumber}
                </span>
                <span>{age} años</span>
                {#if patient.phone}
                    <span>{patient.phone}</span>
                {/if}
            </div>

            <div class="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-stone-500 dark:text-stone-400">
                {#if patient.email}
                    <span>Correo: {patient.email}</span>
                {/if}
                {#if patient.address}
                    <span>Dir: {patient.address}</span>
                {/if}
            </div>
        </div>

        {#if isDoctor}
            <button
                type="button"
                onclick={() => (editOpen = true)}
                class="flex shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-lg
                       border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600
                       transition-colors hover:bg-stone-50 hover:text-stone-900
                       dark:border-stone-700 dark:text-stone-400
                       dark:hover:bg-stone-700 dark:hover:text-stone-50"
            >
                <IconPencil size={15} aria-hidden="true" />
                Editar persona
            </button>
        {/if}
    </div>
</div>

{#if isDoctor && editOpen}
    <PersonEditModal
        {patient}
        onclose={() => (editOpen = false)}
        onsaved={handleSaved}
    />
{/if}
