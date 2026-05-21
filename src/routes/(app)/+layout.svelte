<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
    import '../../app.css';
    import { onMount } from 'svelte';
    import { goto, beforeNavigate } from '$app/navigation';
    import { page } from '$app/state';
    import { auth } from '$lib/features/auth';
    import { authApi, ApiError } from '$lib/api/authApi';
    import { navigation, TopBar, Sidebar } from '$lib/features/navigation';

    let { children } = $props();

    let sidebarOpen = $state(false);
    let loggingOut  = $state(false);

    onMount(async () => {
        if (!auth.isAuthenticated) {
            goto('/login');
            return;
        }
        sidebarOpen = window.matchMedia('(min-width: 768px)').matches;
        await navigation.load();
        navigation.resolveActiveModule(page.url.pathname);
    });

    beforeNavigate(({ to }) => {
        sidebarOpen = false;
        if (to?.url.pathname) {
            navigation.resolveActiveModule(to.url.pathname);
        }
    });

    async function handleLogout() {
        loggingOut = true;
        const refreshToken = auth.getRefreshToken();
        const accessToken  = auth.accessToken;

        if (refreshToken && accessToken) {
            try {
                await authApi.logout(refreshToken, accessToken);
            } catch (err) {
                if (!(err instanceof ApiError)) {
                    // Network failure — still clear local state
                }
            }
        }

        navigation.reset();
        auth.logout();
        await goto('/login');
    }
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@400;500;600&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<!-- Mobile backdrop -->
{#if sidebarOpen}
    <div
        class="fixed inset-0 z-30 bg-stone-950/60 backdrop-blur-sm md:hidden"
        aria-hidden="true"
        onclick={() => (sidebarOpen = false)}
    ></div>
{/if}

<div
    class="flex h-screen flex-col overflow-hidden bg-stone-100 dark:bg-stone-950"
    style="font-family: 'Outfit', sans-serif;"
>
    <!-- Top bar -->
    <TopBar
        {sidebarOpen}
        onToggleSidebar={() => (sidebarOpen = !sidebarOpen)}
        onLogout={handleLogout}
        {loggingOut}
    />

    <!-- Body: sidebar + content -->
    <div class="flex min-h-0 flex-1">
        <Sidebar
            open={sidebarOpen}
            onLogout={handleLogout}
            {loggingOut}
        />

        <!-- Page content -->
        <main
            class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
            id="main-content"
        >
            {@render children()}
        </main>
    </div>
</div>
