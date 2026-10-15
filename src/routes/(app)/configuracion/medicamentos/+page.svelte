<!-- src/routes/(app)/configuracion/medicamentos/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { medications } from '$lib/features/medications';
    import type { MedicationResponse } from '$lib/api/medicationApi';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import MedicationSearchBar from '$lib/features/medications/components/MedicationSearchBar.svelte';
    import MedicationTable from '$lib/features/medications/components/MedicationTable.svelte';
    import MedicationPagination from '$lib/features/medications/components/MedicationPagination.svelte';

    onMount(() => medications.loadPage());

    function handleToggle(item: MedicationResponse, enabled: boolean) {
        return medications.updatePartner(item.medicationCode, { isEnabled: enabled });
    }

    function handleReorderLevel(item: MedicationResponse, value: number) {
        return medications.updatePartner(item.medicationCode, { reorderLevel: value });
    }
</script>

<svelte:head>
    <title>Medicamentos — RxLink</title>
</svelte:head>

<!-- Page header -->
<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
        <h1
            class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
            style="font-family: 'Instrument Serif', serif;"
        >
            Medicamentos
        </h1>
        <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Catálogo compartido: habilita los medicamentos que usa tu centro y define su nivel de reposición
        </p>
    </div>
</div>

<!-- Search bar -->
<div class="mb-4">
    <MedicationSearchBar
        value={medications.search}
        disabled={medications.loading}
        onsearch={(v) => medications.setSearch(v)}
    />
</div>

<!-- Load error -->
{#if medications.error}
    <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
               dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
        {medications.error}
    </div>
{/if}

<!-- Save error -->
{#if medications.submitError}
    <div class="mb-4"><ErrorAlert message={medications.submitError} /></div>
{/if}

<!-- Medication table -->
<MedicationTable
    items={medications.items}
    loading={medications.loading}
    busy={medications.submitting}
    onToggle={handleToggle}
    onReorderLevel={handleReorderLevel}
/>

<!-- Pagination -->
{#if medications.totalCount > 0}
    <div class="mt-4">
        <MedicationPagination
            page={medications.page}
            pageSize={medications.pageSize}
            totalCount={medications.totalCount}
            totalPages={medications.totalPages}
            loading={medications.loading}
            onPageChange={(p) => medications.setPage(p)}
        />
    </div>
{/if}
