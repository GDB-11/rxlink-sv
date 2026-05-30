<!-- src/lib/features/persons/components/PersonForm.svelte -->
<script lang="ts">
    import type { PersonResponse, PersonRequestBody } from '$lib/api/personApi';
    import type { PersonLookups } from '../stores/persons.svelte';
    import PersonFormBody from './PersonFormBody.svelte';

    interface Props {
        open: boolean;
        mode: 'create' | 'edit';
        initial: PersonResponse | null;
        lookups: PersonLookups;
        submitting: boolean;
        error: string | null;
        onsubmit: (data: PersonRequestBody) => void;
        oncancel: () => void;
    }
    let { open, mode, initial, lookups, submitting, error, onsubmit, oncancel }: Props = $props();
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="person-form-title"
    >
        <div class="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">

            <!-- Header -->
            <div class="border-b border-stone-200 px-6 py-4 dark:border-stone-700">
                <h2 id="person-form-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    {mode === 'create' ? 'Nueva persona' : 'Editar persona'}
                </h2>
            </div>

            <!-- {#key} remounts PersonFormBody on every open so fields initialise fresh from props -->
            {#key `${mode}-${initial?.personCode ?? 'new'}`}
                <PersonFormBody
                    {mode}
                    {initial}
                    {lookups}
                    {submitting}
                    {error}
                    {onsubmit}
                    {oncancel}
                />
            {/key}

        </div>
    </div>
{/if}
