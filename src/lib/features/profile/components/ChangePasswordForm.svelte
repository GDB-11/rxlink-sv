<!-- src/lib/features/profile/components/ChangePasswordForm.svelte -->
<script lang="ts">
    import PasswordField from '$lib/components/ui/PasswordField.svelte';
    import PasswordStrengthField from '$lib/components/ui/PasswordStrengthField.svelte';
    import SubmitButton from '$lib/components/ui/SubmitButton.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';

    interface Props {
        submitting: boolean;
        submitError: string | null;
        submitSuccess: boolean;
        onsubmit: (currentPassword: string, newPassword: string) => void;
    }

    let { submitting, submitError, submitSuccess, onsubmit }: Props = $props();

    let currentPassword = $state('');
    let newPassword     = $state('');
    let confirmPassword = $state('');

    const confirmMismatch = $derived(confirmPassword.length > 0 && confirmPassword !== newPassword);
    const canSubmit = $derived(
        currentPassword.length > 0 &&
        newPassword.length >= 8 &&
        newPassword === confirmPassword &&
        !submitting
    );

    function handleSubmit(e: Event) {
        e.preventDefault();
        if (!canSubmit) return;
        onsubmit(currentPassword, newPassword);
    }
</script>

<form onsubmit={handleSubmit} autocomplete="off" class="space-y-5">

    {#if submitSuccess}
        <div
            class="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800
                   dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
            role="status"
        >
            Contraseña actualizada correctamente.
        </div>
    {/if}

    {#if submitError}
        <ErrorAlert message={submitError} />
    {/if}

    <div class="space-y-1.5">
        <label for="current-password" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Contraseña actual
        </label>
        <PasswordField
            id="current-password"
            bind:value={currentPassword}
            placeholder="Contraseña actual"
            autocomplete="current-password"
            disabled={submitting}
        />
    </div>

    <div class="space-y-1.5">
        <label for="new-password" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Nueva contraseña
        </label>
        <PasswordStrengthField
            id="new-password"
            bind:value={newPassword}
            placeholder="Nueva contraseña"
            disabled={submitting}
            minLength={8}
        />
    </div>

    <div class="space-y-1.5">
        <label for="confirm-password" class="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Confirmar nueva contraseña
        </label>
        <PasswordField
            id="confirm-password"
            bind:value={confirmPassword}
            placeholder="Repetir nueva contraseña"
            autocomplete="new-password"
            disabled={submitting}
        />
        {#if confirmMismatch}
            <p class="text-xs text-rose-600 dark:text-rose-400">Las contraseñas no coinciden.</p>
        {/if}
    </div>

    <SubmitButton
        isLoading={submitting}
        disabled={!canSubmit}
        label="Cambiar contraseña"
        loadingLabel="Guardando…"
    />

</form>
