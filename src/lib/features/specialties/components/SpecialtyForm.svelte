<!-- src/lib/features/specialties/components/SpecialtyForm.svelte -->
<script lang="ts">
    import type { SpecialtyResponse, SpecialtyRequestBody } from '$lib/api/specialtyApi';
    import SpecialtyFormBody from './SpecialtyFormBody.svelte';

    interface Props {
        open: boolean;
        mode: 'create' | 'edit';
        initial: SpecialtyResponse | null;
        submitting: boolean;
        error: string | null;
        onsubmit: (data: SpecialtyRequestBody) => void;
        oncancel: () => void;
    }
    let { open, mode, initial, submitting, error, onsubmit, oncancel }: Props = $props();
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="specialty-form-title"
    >
        <div class="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">

            <!-- Header -->
            <div class="border-b border-stone-200 px-6 py-4 dark:border-stone-700">
                <h2 id="specialty-form-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    {mode === 'create' ? 'Nueva especialidad' : 'Editar especialidad'}
                </h2>
            </div>

            <!-- {#key} remounts SpecialtyFormBody on every open so fields initialise fresh from props -->
            {#key `${mode}-${initial?.specialtyCode ?? 'new'}`}
                <SpecialtyFormBody
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
