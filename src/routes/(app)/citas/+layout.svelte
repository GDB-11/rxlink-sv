<script lang="ts">
    import { goto } from '$app/navigation';
    import { auth } from '$lib/features/auth';
    const { children } = $props();
    $effect(() => {
        if (auth.user && auth.roleName !== 'Administrador') goto('/inicio');
    });
</script>
{@render children()}
