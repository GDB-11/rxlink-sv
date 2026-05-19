<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
    import '../../app.css';
	import { onMount } from 'svelte';
	import { goto, beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { ThemeToggle } from '$lib/features/theme';
	import { auth } from '$lib/features/auth';
	import { authApi, ApiError } from '$lib/api/authApi';

	let { children } = $props();

	let sidebarOpen = $state(false);
	let loggingOut = $state(false);

	onMount(() => {
		if (!auth.isAuthenticated) {
			goto('/login');
		}
	});

	beforeNavigate(() => {
		sidebarOpen = false;
	});

	async function handleLogout() {
		loggingOut = true;
		const refreshToken = auth.getRefreshToken();
		const accessToken = auth.accessToken;

		if (refreshToken && accessToken) {
			try {
				await authApi.logout(refreshToken, accessToken);
			} catch (err) {
				if (!(err instanceof ApiError)) {
					// Network failure — still clear local state
				}
			}
		}

		auth.logout();
		await goto('/login');
	}

	const navItems = [
		{
			href: '/',
			label: 'Panel principal',
			icon: `M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25`
		},
		{
			href: '/recetas',
			label: 'Recetas',
			icon: `M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z`
		},
		{
			href: '/pacientes',
			label: 'Pacientes',
			icon: `M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z`
		},
		{
			href: '/medicamentos',
			label: 'Medicamentos',
			icon: `M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5`
		}
	];

	function isActive(href: string) {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}

	function getInitials(fullName: string): string {
		return fullName
			.split(' ')
			.slice(0, 2)
			.map((n) => n[0])
			.join('')
			.toUpperCase();
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

<!-- Mobile sidebar backdrop -->
{#if sidebarOpen}
	<div
		class="fixed inset-0 z-20 bg-stone-950/60 backdrop-blur-sm md:hidden"
		aria-hidden="true"
		onclick={() => (sidebarOpen = false)}
	></div>
{/if}

<div
	class="flex min-h-screen bg-stone-100 dark:bg-stone-900"
	style="font-family: 'Outfit', sans-serif;"
>
	<!-- ─── Sidebar ──────────────────────────────────────────────────────── -->
	<aside
		class="fixed inset-y-0 left-0 z-30 flex w-64 transform
               flex-col border-r
               border-stone-200 bg-white transition-transform
               duration-200 ease-out md:static md:z-auto
               md:translate-x-0 dark:border-stone-700 dark:bg-stone-800
               {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
		aria-label="Navegación principal"
	>
		<!-- Logo -->
		<div
			class="flex shrink-0 items-center gap-1 border-b
                   border-stone-100 px-5 py-5 dark:border-stone-700"
		>
			<span
				style="font-family: 'Instrument Serif', serif;"
				class="text-3xl leading-none text-teal-600 italic dark:text-teal-400"
			>
				Rx
			</span>
			<span
				style="font-family: 'Instrument Serif', serif;"
				class="text-3xl leading-none text-stone-900 dark:text-stone-50"
			>
				Link
			</span>
		</div>

		<!-- Nav items -->
		<nav class="flex-1 overflow-y-auto px-3 py-4" aria-label="Secciones">
			<ul class="space-y-0.5">
				{#each navItems as item}
					<li>
						<a
							href={item.href}
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm
                                   transition-colors duration-150
                                   {isActive(item.href)
								? 'bg-teal-50 font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
								: 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-700/50 dark:hover:text-stone-50'}"
							aria-current={isActive(item.href) ? 'page' : undefined}
						>
							<svg
								class="h-5 w-5 shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
								aria-hidden="true"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
							</svg>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<!-- User info + logout -->
		<div class="shrink-0 space-y-1 border-t border-stone-100 px-3 py-4 dark:border-stone-700">
			{#if auth.user}
				<div
					class="flex items-center gap-3 rounded-lg bg-stone-50 px-3
                           py-2.5 dark:bg-stone-700/50"
				>
					<div
						class="flex h-8 w-8 shrink-0
                               items-center justify-center
                               rounded-full bg-teal-100 text-xs
                               font-medium text-teal-700
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
				</div>
			{/if}

			<button
				onclick={handleLogout}
				disabled={loggingOut}
				class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm
                       text-stone-600 transition-colors
                       duration-150 hover:bg-rose-50
                       hover:text-rose-700 disabled:cursor-not-allowed
                       disabled:opacity-50 dark:text-stone-400
                       dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
			>
				<svg
					class="h-5 w-5 shrink-0"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.5"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
					/>
				</svg>
				{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
			</button>
		</div>
	</aside>

	<!-- ─── Main area ────────────────────────────────────────────────────── -->
	<div class="flex min-w-0 flex-1 flex-col">
		<!-- Top bar -->
		<header
			class="sticky top-0 z-10 flex h-14 items-center
                   justify-between border-b border-stone-200
                   bg-white/80 px-4
                   backdrop-blur-md
                   md:px-6 dark:border-stone-700 dark:bg-stone-800/80"
		>
			<!-- Mobile menu button -->
			<button
				class="inline-flex h-9 w-9 items-center
                       justify-center rounded-lg text-stone-500
                       transition-colors duration-150
                       hover:bg-stone-100 md:hidden
                       dark:text-stone-400 dark:hover:bg-stone-700"
				onclick={() => (sidebarOpen = !sidebarOpen)}
				aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
				aria-expanded={sidebarOpen}
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					{#if sidebarOpen}
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
						/>
					{/if}
				</svg>
			</button>

			<div class="flex-1 md:hidden"></div>

			<!-- Right side: theme toggle -->
			<div class="flex items-center gap-2">
				<ThemeToggle />
			</div>
		</header>

		<!-- Page content -->
		<main class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
			{@render children()}
		</main>
	</div>
</div>
