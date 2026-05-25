<!-- src/lib/features/allergies/components/AllergyForm.svelte -->
<script lang="ts">
    import type { AllergyResponse, AllergyRequestBody } from '$lib/api/allergyApi';
    import AllergyFormBody from './AllergyFormBody.svelte';

    interface Props {
        open: boolean;
        mode: 'create' | 'edit';
        initial: AllergyResponse | null;
        submitting: boolean;
        error: string | null;
        onsubmit: (data: AllergyRequestBody) => void;
        oncancel: () => void;
    }
    let { open, mode, initial, submitting, error, onsubmit, oncancel }: Props = $props();
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="allergy-form-title"
    >
        <div class="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">

            <!-- Header -->
            <div class="border-b border-stone-200 px-6 py-4 dark:border-stone-700">
                <h2 id="allergy-form-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    {mode === 'create' ? 'Nueva alergia' : 'Editar alergia'}
                </h2>
            </div>

            <!-- {#key} remounts AllergyFormBody on every open so fields initialise fresh from props -->
            {#key `${mode}-${initial?.allergyCode ?? 'new'}`}
                <AllergyFormBody
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
