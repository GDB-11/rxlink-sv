<!-- src/lib/features/users/components/UserForm.svelte -->
<script lang="ts">
    import type { UserResponse, CreateUserBody, UpdateUserBody } from '$lib/api/userApi';
    import type { UserLookups } from '../stores/users.svelte';
    import UserFormBody from './UserFormBody.svelte';

    interface Props {
        open: boolean;
        mode: 'create' | 'edit';
        initial: UserResponse | null;
        lookups: UserLookups;
        submitting: boolean;
        error: string | null;
        onsubmit: (data: CreateUserBody | UpdateUserBody) => void;
        oncancel: () => void;
    }
    let { open, mode, initial, lookups, submitting, error, onsubmit, oncancel }: Props = $props();
</script>

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-labelledby="user-form-title"
    >
        <div class="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-stone-800">

            <!-- Header -->
            <div class="border-b border-stone-200 px-6 py-4 dark:border-stone-700">
                <h2 id="user-form-title" class="text-base font-semibold text-stone-900 dark:text-stone-50">
                    {mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
                </h2>
            </div>

            <!-- {#key} remounts UserFormBody on every open so fields initialise fresh from props -->
            {#key `${mode}-${initial?.userCode ?? 'new'}`}
                <UserFormBody
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
