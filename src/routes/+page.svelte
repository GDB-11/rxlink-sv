<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { auth } from '$lib/features/auth';

    onMount(() => {
        if (auth.isAuthenticated) {
            goto('/inicio', { replaceState: true });
        } else {
            goto('/login', { replaceState: true });
        }
    });
</script>
