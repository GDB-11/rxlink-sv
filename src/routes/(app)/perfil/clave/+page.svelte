<!-- src/routes/(app)/perfil/clave/+page.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { profile, ChangePasswordForm } from '$lib/features/profile';
    import { IconArrowLeft } from '@tabler/icons-svelte';

    function handleSubmit(currentPassword: string, newPassword: string) {
        profile.changePassword(currentPassword, newPassword);
    }
</script>

<svelte:head>
    <title>Cambiar contraseña — RxLink</title>
</svelte:head>

<div class="mx-auto max-w-md space-y-6">

    <!-- Page header -->
    <div class="flex items-center gap-3">
        <button
            onclick={() => goto('/perfil')}
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200
                   text-stone-500 transition-colors hover:bg-stone-100 cursor-pointer
                   dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Volver al perfil"
        >
            <IconArrowLeft size={16} aria-hidden="true" />
        </button>
        <h1 class="text-xl font-semibold text-stone-900 dark:text-stone-50">Cambiar contraseña</h1>
    </div>

    <!-- Form card -->
    <div class="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
        <ChangePasswordForm
            submitting={profile.submitting}
            submitError={profile.submitError}
            submitSuccess={profile.submitSuccess}
            onsubmit={handleSubmit}
        />
    </div>

</div>
