<script lang="ts">
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { auth } from '$lib/features/auth';
    const { children } = $props();
    $effect(() => {
        if (auth.user && auth.roleName !== 'Administrador') goto(resolve('/inicio'));
    });
</script>
{@render children()}
