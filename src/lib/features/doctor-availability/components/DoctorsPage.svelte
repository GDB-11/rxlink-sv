<!-- src/lib/features/doctor-availability/components/DoctorsPage.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { userApi, type UserResponse } from '$lib/api/userApi';
    import { specialtyApi, type SpecialtyResponse } from '$lib/api/specialtyApi';
    import DoctorTable from './DoctorTable.svelte';
    import UserPagination from '$lib/features/users/components/UserPagination.svelte';
    import UserSearchBar from '$lib/features/users/components/UserSearchBar.svelte';
    import SearchSelect from '$lib/components/ui/SearchSelect.svelte';

    const PAGE_SIZE = 20;

    let items         = $state<UserResponse[]>([]);
    let loading       = $state(false);
    let error         = $state<string | null>(null);
    let page          = $state(1);
    let totalCount    = $state(0);
    let totalPages    = $state(0);
    let search        = $state('');
    let specialtyCode = $state('');
    let specialties   = $state<SpecialtyResponse[]>([]);

    const specialtyOptions = $derived([
        { value: '', label: 'Todas las especialidades' },
        ...specialties.map(s => ({ value: s.specialtyCode, label: s.name }))
    ]);

    async function loadPage() {
        loading = true;
        error   = null;
        try {
            const data = await userApi.getPage(page, PAGE_SIZE, search, 'Doctor', specialtyCode || undefined);
            items      = data.items;
            totalCount = data.totalCount;
            totalPages = data.totalPages;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Error al cargar los doctores.';
        } finally {
            loading = false;
        }
    }

    async function handlePageChange(p: number) {
        page = p;
        await loadPage();
    }

    async function handleSearch(value: string) {
        search = value;
        page   = 1;
        await loadPage();
    }

    async function handleSpecialtyChange(value: string) {
        specialtyCode = value;
        page          = 1;
        await loadPage();
    }

    onMount(async () => {
        const data = await specialtyApi.getPage(1, 100);
        specialties = data.items.filter(s => s.isActive);
        await loadPage();
    });
</script>

<div class="mb-6">
    <h1
        class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
        style="font-family: 'Instrument Serif', serif;"
    >
        Doctores
    </h1>
    <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
        Directorio de doctores activos
    </p>
</div>

<div class="mb-4 flex flex-col gap-3 sm:flex-row">
    <div class="flex-1">
        <UserSearchBar
            value={search}
            disabled={loading}
            onsearch={handleSearch}
        />
    </div>
    <div class="sm:w-56">
        <SearchSelect
            bind:value={specialtyCode}
            options={specialtyOptions}
            placeholder="Todas las especialidades"
            disabled={loading}
            onchange={handleSpecialtyChange}
        />
    </div>
</div>

{#if error}
    <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
               dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
        {error}
    </div>
{/if}

<DoctorTable {items} {loading} />

{#if totalPages > 1 || totalCount > 0}
    <div class="mt-4">
        <UserPagination
            {page}
            pageSize={PAGE_SIZE}
            {totalCount}
            {totalPages}
            {loading}
            onPageChange={handlePageChange}
        />
    </div>
{/if}
