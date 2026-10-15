<!-- src/routes/(app)/configuracion/especialidades/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { specialties } from '$lib/features/specialties';
    import type { SpecialtyResponse } from '$lib/api/specialtyApi';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import SpecialtySearchBar from '$lib/features/specialties/components/SpecialtySearchBar.svelte';
    import SpecialtyTable from '$lib/features/specialties/components/SpecialtyTable.svelte';
    import SpecialtyPagination from '$lib/features/specialties/components/SpecialtyPagination.svelte';

    onMount(() => specialties.loadPage());

    function handleToggle(item: SpecialtyResponse, enabled: boolean) {
        return specialties.updatePartner(item.specialtyCode, { isEnabled: enabled });
    }

    function handlePrice(item: SpecialtyResponse, kind: 'priceInPerson' | 'priceVirtual', value: number) {
        return specialties.updatePartner(item.specialtyCode, { [kind]: value });
    }
</script>

<svelte:head>
    <title>Especialidades — RxLink</title>
</svelte:head>

<!-- Page header -->
<div class="mb-6">
    <h1
        class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
        style="font-family: 'Instrument Serif', serif;"
    >
        Especialidades del centro
    </h1>
    <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
        Catálogo compartido: habilita las especialidades que ofrece tu centro y define sus precios
    </p>
</div>

<!-- Search bar -->
<div class="mb-4">
    <SpecialtySearchBar
        value={specialties.search}
        disabled={specialties.loading}
        onsearch={(v) => specialties.setSearch(v)}
    />
</div>

<!-- Save error -->
{#if specialties.submitError}
    <div class="mb-4"><ErrorAlert message={specialties.submitError} /></div>
{/if}

<!-- Load error -->
{#if specialties.error}
    <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
               dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
        {specialties.error}
    </div>
{/if}

<!-- Specialty table -->
<SpecialtyTable
    items={specialties.items}
    loading={specialties.loading}
    busy={specialties.submitting}
    onToggle={handleToggle}
    onPrice={handlePrice}
/>

<!-- Pagination -->
{#if specialties.totalCount > 0}
    <div class="mt-4">
        <SpecialtyPagination
            page={specialties.page}
            pageSize={specialties.pageSize}
            totalCount={specialties.totalCount}
            totalPages={specialties.totalPages}
            loading={specialties.loading}
            onPageChange={(p) => specialties.setPage(p)}
        />
    </div>
{/if}
