<!-- src/lib/features/navigation/components/Sidebar.svelte -->
<script lang="ts">
    import { page } from '$app/state';
    import {
        IconHome,
        IconFileAlert,
        IconClock,
        IconList,
        IconUserPlus,
        IconLock,
        IconPill,
        IconCertificate,
        IconAlertTriangle,
        IconIdBadge,
        IconActivity,
        IconFileCheck,
        IconHistory,
        IconPlus,
        IconPencil,
        IconArrowBarRight,
        IconLayoutDashboard,
        IconStethoscope,
        IconCalendar,
        IconCalendarPlus,
        IconClipboardHeart,
        IconNurse
    } from '@tabler/icons-svelte';
    import { auth } from '$lib/features/auth';
    import { navigation } from '../stores/navigation.svelte';

    interface Props {
        open: boolean;
        onLogout: () => void;
        loggingOut: boolean;
    }

    let { open, onLogout, loggingOut }: Props = $props();

    const itemIcons: Record<string, typeof IconHome> = {
        'home':             IconHome,
        'file-alert':       IconFileAlert,
        'clock':            IconClock,
        'list':             IconList,
        'user-plus':        IconUserPlus,
        'lock':             IconLock,
        'pill':             IconPill,
        'certificate':      IconCertificate,
        'alert-triangle':   IconAlertTriangle,
        'id-badge':         IconIdBadge,
        'activity':         IconActivity,
        'file-check':       IconFileCheck,
        'history':          IconHistory,
        'plus':             IconPlus,
        'pencil':           IconPencil,
        'arrow-bar-right':  IconArrowBarRight,
        'stethoscope':      IconStethoscope,
        'calendar':         IconCalendar,
        'calendar-plus':    IconCalendarPlus,
        'clipboard-heart':  IconClipboardHeart,
        'nurse':            IconNurse
    };

    function isActive(path: string): boolean {
        return page.url.pathname === path;
    }

    function getInitials(fullName: string): string {
        return fullName
            .split(' ')
            .slice(0, 2)
            .map(n => n[0])
            .join('')
            .toUpperCase();
    }

    const items = $derived(
        (navigation.activeModule?.items ?? []).slice().sort((a, b) => a.order - b.order)
    );
</script>

<!--
    Outer aside: animation only — no visual styles.
    Mobile  → translateX slide (fixed overlay).
    Desktop → width collapse to 0 (in-flow, content clipped by overflow-hidden).
    Inner div: always w-60 so it holds its layout while the outer compresses.
-->
<aside
    class="shrink-0 overflow-hidden transition-[width,transform] duration-200 ease-out
           fixed inset-y-0 left-0 z-40 w-60
           md:static md:z-auto
           {open ? 'translate-x-0 md:w-60' : '-translate-x-full md:w-0 md:translate-x-0'}"
    aria-label="Navegación lateral"
>
    <div class="flex h-full w-60 shrink-0 flex-col border-r border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">

        <!-- Active module label -->
        <div class="flex shrink-0 items-center border-b border-stone-100 px-4 py-3 dark:border-stone-800">
            {#if navigation.activeModule}
                <span class="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    {navigation.activeModule.label}
                </span>
            {:else}
                <div class="h-3 w-20 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
            {/if}
        </div>

        <!-- Nav items -->
        <nav class="flex-1 overflow-y-auto px-2 py-3" aria-label="Secciones del módulo">
            {#if navigation.loading}
                <ul class="space-y-0.5">
                    {#each [1, 2, 3] as n (n)}
                        <li class="flex items-center gap-3 rounded-lg px-3 py-2.5">
                            <div class="h-5 w-5 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                            <div class="h-4 w-28 animate-pulse rounded bg-stone-200 dark:bg-stone-700"></div>
                        </li>
                    {/each}
                </ul>
            {:else if items.length === 0}
                <p class="px-3 py-2 text-sm text-stone-400 dark:text-stone-600">Sin elementos.</p>
            {:else}
                <ul class="space-y-0.5">
                    {#each items as item (item.itemCode)}
                        {@const IconComponent = itemIcons[item.icon] ?? IconLayoutDashboard}
                        {@const active = isActive(item.path)}
                        <li>
                            <a
                                href={item.path}
                                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm
                                       transition-colors duration-150
                                       {active
                                           ? 'bg-teal-50 font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                                           : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-50'}"
                                aria-current={active ? 'page' : undefined}
                            >
                                <IconComponent size={18} aria-hidden="true" class="shrink-0" />
                                {item.label}
                            </a>
                        </li>
                    {/each}
                </ul>
            {/if}
        </nav>

        <!-- User info + logout -->
        <div class="shrink-0 space-y-1 border-t border-stone-100 px-2 py-3 dark:border-stone-800">
            {#if auth.user}
                <a
                    href="/perfil"
                    class="flex items-center gap-3 rounded-lg bg-stone-50 px-3
                           py-2.5 transition-colors hover:bg-stone-100
                           dark:bg-stone-800/60 dark:hover:bg-stone-700/60"
                    aria-label="Ver mi perfil"
                >
                    <div
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                               bg-teal-100 text-xs font-semibold text-teal-700
                               dark:bg-teal-900 dark:text-teal-300"
                        aria-hidden="true"
                    >
                        {getInitials(auth.user.fullName)}
                    </div>
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-stone-900 dark:text-stone-50">
                            {auth.user.fullName}
                        </p>
                        <p class="truncate text-xs text-stone-500 dark:text-stone-400">
                            {auth.user.username}
                        </p>
                    </div>
                </a>
            {/if}

            <!-- Logout (mobile) -->
            <button
                onclick={onLogout}
                disabled={loggingOut}
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm
                       text-stone-600 transition-colors duration-150
                       hover:bg-rose-50 hover:text-rose-700
                       disabled:cursor-not-allowed disabled:opacity-50
                       md:hidden dark:text-stone-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
            >
                <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                    />
                </svg>
                {loggingOut ? 'Saliendo…' : 'Cerrar sesión'}
            </button>
        </div>

    </div>
</aside>
