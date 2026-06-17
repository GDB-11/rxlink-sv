<script lang="ts">
    import { goto } from '$app/navigation';
    import { auth } from '$lib/features/auth';

    let { children } = $props();

    $effect(() => {
        if (auth.user && auth.roleName !== 'Doctor') {
            goto('/inicio');
        }
    });
</script>

{@render children()}
