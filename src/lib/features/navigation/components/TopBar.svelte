<!-- src/lib/features/navigation/components/TopBar.svelte -->
<script lang="ts">
    import {
        IconLayoutDashboard,
        IconUsers,
        IconSettings,
        IconChartBar,
        IconFileText,
        IconUserCircle,
        IconPill,
        IconMenu2,
        IconX,
        IconStethoscope
    } from '@tabler/icons-svelte';
    import { ThemeToggle } from '$lib/features/theme';
    import { auth } from '$lib/features/auth';
    import { navigation } from '../stores/navigation.svelte';

    interface Props {
        sidebarOpen: boolean;
        onToggleSidebar: () => void;
        onLogout: () => void;
        loggingOut: boolean;
    }

    let { sidebarOpen, onToggleSidebar, onLogout, loggingOut }: Props = $props();

    const moduleIcons: Record<string, typeof IconLayoutDashboard> = {
        'layout-dashboard': IconLayoutDashboard,
        'users':            IconUsers,
        'settings':         IconSettings,
        'chart-bar':        IconChartBar,
        'file-text':        IconFileText,
        'user-circle':      IconUserCircle,
        'pill':             IconPill,
        'stethoscope':      IconStethoscope
    };

    function getInitials(fullName: string): string {
        return fullName
            .split(' ')
            .slice(0, 2)
            .map(n => n[0])
            .join('')
            .toUpperCase();
    }
</script>

<header
    class="sticky top-0 z-30 flex h-14 items-center gap-2 border-b
           border-stone-200 bg-white/90 px-3 backdrop-blur-md
           dark:border-stone-700 dark:bg-stone-900/90 md:px-4"
>
    <!-- Mobile: hamburger -->
    <button
        class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
               text-stone-500 transition-colors hover:bg-stone-100 cursor-pointer
               dark:text-stone-400 dark:hover:bg-stone-800"
        onclick={onToggleSidebar}
        aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={sidebarOpen}
    >
        {#if sidebarOpen}
            <IconX size={20} aria-hidden="true" />
        {:else}
            <IconMenu2 size={20} aria-hidden="true" />
        {/if}
    </button>

    <!-- Logo -->
    <a
        href="/"
        class="flex shrink-0 items-center gap-0.5 md:w-56 md:border-r
               md:border-stone-200 md:pr-4 dark:md:border-stone-700"
        aria-label="Ir al inicio"
    >
        <span
            style="font-family: 'Instrument Serif', serif;"
            class="text-2xl leading-none text-teal-600 italic dark:text-teal-400"
        >Rx</span>
        <span
            style="font-family: 'Instrument Serif', serif;"
            class="text-2xl leading-none text-stone-900 dark:text-stone-50"
        >Link</span>
    </a>

    <!-- Module tabs (topbar navigation) -->
    <nav
        class="hidden flex-1 items-center gap-0.5 overflow-x-auto md:flex"
        aria-label="Módulos"
    >
        {#if navigation.loading}
            <div class="flex gap-2 px-2">
                {#each [1, 2, 3, 4] as n (n)}
                    <div class="h-8 w-24 animate-pulse rounded-md bg-stone-200 dark:bg-stone-700"></div>
                {/each}
            </div>
        {:else}
            {#each navigation.modules as mod (mod.moduleCode)}
                {@const IconComponent = moduleIcons[mod.icon] ?? IconLayoutDashboard}
                {@const isActive = navigation.activeModuleCode === mod.moduleCode}
                <button
                    onclick={() => navigation.setActiveModule(mod.moduleCode)}
                    class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm cursor-pointer
                           font-medium whitespace-nowrap transition-colors duration-150
                           {isActive
                               ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                               : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-50'}"
                    aria-current={isActive ? 'true' : undefined}
                >
                    <IconComponent size={16} aria-hidden="true" />
                    {mod.label}
                </button>
            {/each}
        {/if}
    </nav>

    <div class="flex flex-1 items-center justify-end gap-2 md:flex-none">
        <ThemeToggle />

        <!-- User avatar (desktop) -->
        {#if auth.user}
            <div
                class="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full
                       bg-teal-100 text-xs font-semibold text-teal-700
                       md:flex dark:bg-teal-900 dark:text-teal-300"
                title={auth.user.fullName}
                aria-label={auth.user.fullName}
            >
                {getInitials(auth.user.fullName)}
            </div>
        {/if}

        <!-- Logout (desktop) -->
        <button
            onclick={onLogout}
            disabled={loggingOut}
            class="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm cursor-pointer
                   text-stone-600 transition-colors duration-150
                   hover:bg-rose-50 hover:text-rose-700
                   disabled:cursor-not-allowed disabled:opacity-50
                   md:flex dark:text-stone-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
        >
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
            </svg>
            {loggingOut ? 'Saliendo…' : 'Salir'}
        </button>
    </div>
</header>
