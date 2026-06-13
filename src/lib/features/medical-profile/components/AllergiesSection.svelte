<!-- src/lib/features/medical-profile/components/AllergiesSection.svelte -->
<script lang="ts">
    import { IconPlus } from '@tabler/icons-svelte';
    import type { PatientAllergyResponse } from '$lib/api/patientApi';
    import PatientAllergyCard from './PatientAllergyCard.svelte';
    import PatientAllergyForm from './PatientAllergyForm.svelte';

    interface Props {
        allergies: PatientAllergyResponse[];
        isDoctor: boolean;
    }
    let { allergies, isDoctor }: Props = $props();

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
        {#if isDoctor}
            <button
                type="button"
                onclick={openCreate}
                class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5
                       text-sm font-medium text-stone-600 transition-colors
                       hover:bg-stone-50 hover:text-stone-900
                       dark:border-stone-700 dark:text-stone-400
                       dark:hover:bg-stone-700 dark:hover:text-stone-50"
            >
                <IconPlus size={14} aria-hidden="true" />
                Agregar
            </button>
        {/if}
    </div>

    {#if allergies.length === 0}
        <p class="text-sm text-stone-400 dark:text-stone-500">Sin alergias registradas.</p>
    {:else}
        <ul class="space-y-2">
            {#each allergies as allergy (allergy.patientAllergyCode)}
                <li>
                    <PatientAllergyCard
                        {allergy}
                        {isDoctor}
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
