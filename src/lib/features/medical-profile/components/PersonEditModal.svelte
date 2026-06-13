<!-- src/lib/features/medical-profile/components/PersonEditModal.svelte -->
<!-- Mounted only when the parent sets editOpen=true — onMount loads data on each open. -->
<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import { personApi, type PersonResponse, type PersonRequestBody } from '$lib/api/personApi';
    import { lookupsApi } from '$lib/api/lookupsApi';
    import type { PatientResponse } from '$lib/api/patientApi';
    import type { PersonLookups } from '$lib/features/persons/stores/persons.svelte';
    import PersonFormBody from '$lib/features/persons/components/PersonFormBody.svelte';

    interface Props {
        patient: PatientResponse;
        onclose: () => void;
        onsaved: (updated: PersonResponse) => void;
    }
    let { patient, onclose, onsaved }: Props = $props();

    let person      = $state<PersonResponse | null>(null);
    let lookups     = $state<PersonLookups>({ sexes: [], documentTypes: [] });
    let loading     = $state(true);
    let loadError   = $state<string | null>(null);
    let submitting  = $state(false);
    let submitError = $state<string | null>(null);

    onMount(async () => {
        const personCode = untrack(() => patient.personCode);
        try {
            const [personData, lookupsData] = await Promise.all([
                personApi.getByCode(personCode),
                lookupsApi.getUserLookups()
            ]);
            person  = personData;
            lookups = { sexes: lookupsData.sexes, documentTypes: lookupsData.documentTypes };
        } catch (err) {
            loadError = err instanceof Error ? err.message : 'Error al cargar los datos de la persona.';
        } finally {
            loading = false;
        }
    });

    async function handleSubmit(data: PersonRequestBody): Promise<void> {
        submitting  = true;
        submitError = null;
        try {
            const updated = await personApi.update(untrack(() => patient.personCode), data);
            onsaved(updated);
        } catch (err) {
            submitError = err instanceof Error ? err.message : 'Error al actualizar la persona.';
        } finally {
            submitting = false;
        }
    }
</script>

<div
    class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
    aria-modal="true"
    role="dialog"
    aria-labelledby="person-edit-title"
>
    <div class="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">

        <div class="border-b border-stone-200 px-6 py-4 dark:border-stone-700">
            <h2 id="person-edit-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                Editar persona
            </h2>
        </div>

        {#if loading}
            <div class="flex items-center justify-center px-6 py-12">
                <span
                    class="h-6 w-6 animate-spin rounded-full border-2 border-stone-200 border-t-teal-500
                           dark:border-stone-700 dark:border-t-teal-400"
                    aria-hidden="true"
                ></span>
            </div>

        {:else if loadError}
            <div class="px-6 py-5">
                <p class="text-sm text-rose-600 dark:text-rose-400">{loadError}</p>
                <button
                    type="button"
                    onclick={onclose}
                    class="mt-4 cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm
                           font-medium text-stone-600 transition-colors hover:bg-stone-50
                           dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700"
                >
                    Cerrar
                </button>
            </div>

        {:else if person}
            {#key person.personCode}
                <PersonFormBody
                    mode="edit"
                    initial={person}
                    {lookups}
                    {submitting}
                    error={submitError}
                    onsubmit={handleSubmit}
                    oncancel={onclose}
                />
            {/key}
        {/if}

    </div>
</div>
