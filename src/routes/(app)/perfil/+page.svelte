<!-- src/routes/(app)/perfil/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { profile, ProfileInfoCard } from '$lib/features/profile';
    import { IconLock } from '@tabler/icons-svelte';

    onMount(() => {
        profile.load();
    });
</script>

<svelte:head>
    <title>Mi perfil — RxLink</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-6">

    <!-- Page header -->
    <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-stone-900 dark:text-stone-50">Mi perfil</h1>
        <a
            href="/perfil/clave"
            class="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5
                   text-sm text-stone-600 transition-colors
                   hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700
                   dark:border-stone-700 dark:text-stone-400
                   dark:hover:border-teal-700 dark:hover:bg-teal-900/30 dark:hover:text-teal-300"
        >
            <IconLock size={15} aria-hidden="true" />
            Cambiar contraseña
        </a>
    </div>

    <!-- Loading -->
    {#if profile.loading}
        <div class="space-y-6">
            <div class="flex items-center gap-4">
                <div class="h-16 w-16 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700"></div>
                <div class="space-y-2">
                    <div class="h-5 w-48 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                    <div class="h-4 w-24 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                </div>
            </div>
            <div class="h-48 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-700"></div>
            <div class="h-40 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-700"></div>
        </div>

    <!-- Error -->
    {:else if profile.error}
        <div
            class="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4
                   text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
            role="alert"
        >
            {profile.error}
        </div>

    <!-- Profile data -->
    {:else if profile.data}
        <ProfileInfoCard data={profile.data} />
    {/if}

</div>
