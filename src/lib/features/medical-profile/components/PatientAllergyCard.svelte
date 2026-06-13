<!-- src/lib/features/medical-profile/components/PatientAllergyCard.svelte -->
<script lang="ts">
    import { IconPencil, IconTrash } from '@tabler/icons-svelte';
    import type { PatientAllergyResponse } from '$lib/api/patientApi';
    import { medicalProfile } from '../stores/medicalProfile.svelte';

    interface Props {
        allergy:  PatientAllergyResponse;
        isDoctor: boolean;
        onedit:   () => void;
    }
    let { allergy, isDoctor, onedit }: Props = $props();

    let confirmDelete = $state(false);

    async function handleDelete(): Promise<void> {
        const ok = await medicalProfile.removeAllergy(allergy.patientAllergyCode);
        if (ok) confirmDelete = false;
    }

    function severityBadge(name: string | null): string {
        if (!name) return 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300';
        const n = name.toLowerCase();
        if (n === 'grave')    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
        if (n === 'moderada') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
        if (n === 'leve')     return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
        return 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300';
    }
</script>

<div class="flex items-start justify-between gap-3 rounded-lg border border-stone-200 bg-stone-50
           px-4 py-3 dark:border-stone-700 dark:bg-stone-800/50">
    <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-medium text-stone-800 dark:text-stone-100">
                {allergy.allergyName}
            </span>
            {#if allergy.severityName}
                <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold {severityBadge(allergy.severityName)}">
                    {allergy.severityName}
                </span>
            {/if}
        </div>
        {#if allergy.notes}
            <p class="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                Nota: {allergy.notes}
            </p>
        {/if}
    </div>

    {#if isDoctor}
        <div class="flex shrink-0 items-center gap-1">
            <button
                type="button"
                onclick={onedit}
                class="cursor-pointer rounded p-1 text-stone-400 transition-colors
                       hover:bg-stone-200 hover:text-stone-600
                       dark:hover:bg-stone-700 dark:hover:text-stone-300"
                aria-label="Editar {allergy.allergyName}"
            >
                <IconPencil size={15} aria-hidden="true" />
            </button>
            <button
                type="button"
                onclick={() => (confirmDelete = true)}
                class="cursor-pointer rounded p-1 text-stone-400 transition-colors
                       hover:bg-rose-100 hover:text-rose-600
                       dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                aria-label="Eliminar {allergy.allergyName}"
            >
                <IconTrash size={15} aria-hidden="true" />
            </button>
        </div>
    {/if}
</div>

{#if confirmDelete}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="alertdialog"
        aria-labelledby="allergy-confirm-title"
        aria-describedby="allergy-confirm-desc"
    >
        <div class="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">
            <div class="px-6 py-5">
                <h3 id="allergy-confirm-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    Eliminar alergia
                </h3>
                <p id="allergy-confirm-desc" class="mt-2 text-sm text-stone-600 dark:text-stone-400">
                    ¿Eliminar la alergia
                    <strong class="font-medium text-stone-900 dark:text-stone-100">{allergy.allergyName}</strong>?
                </p>
                {#if medicalProfile.submitError}
                    <div class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                               text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                        {medicalProfile.submitError}
                    </div>
                {/if}
            </div>
            <div class="flex justify-end gap-3 border-t border-stone-200 px-6 py-4 dark:border-stone-700">
                <button
                    type="button"
                    onclick={() => { confirmDelete = false; medicalProfile.clearSubmitError(); }}
                    disabled={medicalProfile.submitting}
                    class="cursor-pointer rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium
                           text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:border-stone-700 dark:text-stone-400
                           dark:hover:bg-stone-700 dark:hover:text-stone-50"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onclick={handleDelete}
                    disabled={medicalProfile.submitting}
                    class="cursor-pointer rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium
                           text-white transition-colors hover:bg-rose-600
                           disabled:cursor-not-allowed disabled:opacity-50
                           dark:bg-rose-600 dark:hover:bg-rose-700"
                >
                    {medicalProfile.submitting ? 'Eliminando…' : 'Eliminar'}
                </button>
            </div>
        </div>
    </div>
{/if}
