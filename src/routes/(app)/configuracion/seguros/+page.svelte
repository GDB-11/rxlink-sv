<!-- src/routes/(app)/configuracion/seguros/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { insurances } from '$lib/features/insurances';
    import type { InsuranceResponse } from '$lib/api/insuranceApi';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import InsuranceSearchBar from '$lib/features/insurances/components/InsuranceSearchBar.svelte';
    import InsuranceTable from '$lib/features/insurances/components/InsuranceTable.svelte';
    import InsurancePagination from '$lib/features/insurances/components/InsurancePagination.svelte';

    onMount(() => insurances.loadPage());

    function handleToggle(item: InsuranceResponse, enabled: boolean) {
        return insurances.updatePartner(item.insuranceCode, { isEnabled: enabled });
    }

    function handleCoverage(item: InsuranceResponse, value: number) {
        return insurances.updatePartner(item.insuranceCode, { coveragePercentageOverride: value });
    }

    function handleClearCoverage(item: InsuranceResponse) {
        return insurances.updatePartner(item.insuranceCode, { clearCoverageOverride: true });
    }
</script>

<svelte:head>
    <title>Seguros — RxLink</title>
</svelte:head>

<!-- Page header -->
<div class="mb-6">
    <h1
        class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
        style="font-family: 'Instrument Serif', serif;"
    >
        Seguros aceptados
    </h1>
    <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
        Catálogo compartido: elige los seguros que acepta tu centro y, si hace falta, ajusta su cobertura
    </p>
</div>

<!-- Search bar -->
<div class="mb-4">
    <InsuranceSearchBar
        value={insurances.search}
        disabled={insurances.loading}
        onsearch={(v) => insurances.setSearch(v)}
    />
</div>

<!-- Save error -->
{#if insurances.submitError}
    <div class="mb-4"><ErrorAlert message={insurances.submitError} /></div>
{/if}

<!-- Load error -->
{#if insurances.error}
    <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
               dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
        {insurances.error}
    </div>
{/if}

<!-- Insurance table -->
<InsuranceTable
    items={insurances.items}
    loading={insurances.loading}
    busy={insurances.submitting}
    onToggle={handleToggle}
    onCoverage={handleCoverage}
    onClearCoverage={handleClearCoverage}
/>

<!-- Pagination -->
{#if insurances.totalCount > 0}
    <div class="mt-4">
        <InsurancePagination
            page={insurances.page}
            pageSize={insurances.pageSize}
            totalCount={insurances.totalCount}
            totalPages={insurances.totalPages}
            loading={insurances.loading}
            onPageChange={(p) => insurances.setPage(p)}
        />
    </div>
{/if}
