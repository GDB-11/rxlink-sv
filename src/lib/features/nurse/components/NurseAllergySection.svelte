<!-- src/lib/features/nurse/components/NurseAllergySection.svelte -->
<script lang="ts">
    import { IconPlus } from '@tabler/icons-svelte';
    import type { PatientAllergyResponse } from '$lib/api/patientApi';
    import PatientAllergyCard from '$lib/features/medical-profile/components/PatientAllergyCard.svelte';
    import PatientAllergyForm from '$lib/features/medical-profile/components/PatientAllergyForm.svelte';

    interface Props {
        allergies:   PatientAllergyResponse[];
        submitting:  boolean;
        submitError: string | null;
    }
    let { allergies, submitting, submitError }: Props = $props();

    let formOpen   = $state(false);
    let editTarget = $state<PatientAllergyResponse | null>(null);

    function openCreate() {
        editTarget = null;
        formOpen   = true;
    }

    function openEdit(allergy: PatientAllergyResponse) {
        editTarget = allergy;
        formOpen   = true;
    }

    function closeForm() {
        formOpen   = false;
        editTarget = null;
    }
</script>

<section>
    <div class="mb-3 flex items-center justify-between">
        <h2 class="text-base font-semibold text-stone-800 dark:text-stone-100">Alergias</h2>
        <button
            type="button"
            onclick={openCreate}
            disabled={submitting}
            class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5
                   text-sm font-medium text-stone-600 transition-colors
                   hover:bg-stone-50 hover:text-stone-900
                   disabled:cursor-not-allowed disabled:opacity-50
                   dark:border-stone-700 dark:text-stone-400
                   dark:hover:bg-stone-700 dark:hover:text-stone-50"
        >
            <IconPlus size={14} aria-hidden="true" />
            Agregar
        </button>
    </div>

    {#if submitError}
        <div class="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                   text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
            {submitError}
        </div>
    {/if}

    {#if allergies.length === 0}
        <p class="text-sm text-stone-400 dark:text-stone-500">Sin alergias registradas.</p>
    {:else}
        <ul class="space-y-2">
            {#each allergies as allergy (allergy.patientAllergyCode)}
                <li>
                    <PatientAllergyCard
                        {allergy}
                        isDoctor={true}
                        onedit={() => openEdit(allergy)}
                    />
                </li>
            {/each}
        </ul>
    {/if}
</section>

{#key editTarget?.patientAllergyCode ?? 'new'}
    <PatientAllergyForm
        open={formOpen}
        allergy={editTarget}
        onclose={closeForm}
    />
{/key}
