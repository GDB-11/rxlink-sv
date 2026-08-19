<!-- src/routes/(app)/configuracion/seguros/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { IconPlus } from '@tabler/icons-svelte';
    import { insurances } from '$lib/features/insurances';
    import type { InsuranceResponse, InsuranceRequestBody } from '$lib/api/insuranceApi';
    import InsuranceSearchBar from '$lib/features/insurances/components/InsuranceSearchBar.svelte';
    import InsuranceTable from '$lib/features/insurances/components/InsuranceTable.svelte';
    import InsurancePagination from '$lib/features/insurances/components/InsurancePagination.svelte';
    import InsuranceForm from '$lib/features/insurances/components/InsuranceForm.svelte';
    import DeactivateConfirmModal from '$lib/features/insurances/components/DeactivateConfirmModal.svelte';
    import ActivateConfirmModal from '$lib/features/insurances/components/ActivateConfirmModal.svelte';

    let formOpen = $state(false);
    let formMode = $state<'create' | 'edit'>('create');
    let editTarget = $state<InsuranceResponse | null>(null);

    let confirmOpen = $state(false);
    let deactivateTarget = $state<InsuranceResponse | null>(null);

    let activateOpen = $state(false);
    let activateTarget = $state<InsuranceResponse | null>(null);

    onMount(() => insurances.loadPage());

    function openCreate() {
        editTarget = null;
        formMode = 'create';
        insurances.clearSubmitError();
        formOpen = true;
    }

    function openEdit(item: InsuranceResponse) {
        editTarget = item;
        formMode = 'edit';
        insurances.clearSubmitError();
        formOpen = true;
    }

    function openDeactivate(item: InsuranceResponse) {
        deactivateTarget = item;
        insurances.clearSubmitError();
        confirmOpen = true;
    }

    function openActivate(item: InsuranceResponse) {
        activateTarget = item;
        insurances.clearSubmitError();
        activateOpen = true;
    }

    async function handleFormSubmit(data: InsuranceRequestBody) {
        const success =
            formMode === 'create'
                ? await insurances.create(data)
                : await insurances.update(editTarget!.insuranceCode, data);
        if (success) formOpen = false;
    }

    async function handleDeactivate() {
        if (!deactivateTarget) return;
        const success = await insurances.deactivate(deactivateTarget.insuranceCode);
        if (success) confirmOpen = false;
    }

    async function handleActivate() {
        if (!activateTarget) return;
        const success = await insurances.activate(activateTarget.insuranceCode);
        if (success) activateOpen = false;
    }
</script>

<svelte:head>
    <title>Seguros — RxLink</title>
</svelte:head>

<!-- Page header -->
<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
        <h1
            class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
            style="font-family: 'Instrument Serif', serif;"
        >
            Seguros
        </h1>
        <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Gestión del catálogo de seguros y su porcentaje de cobertura
        </p>
    </div>

    <button
        type="button"
        onclick={openCreate}
        class="inline-flex cursor-pointer items-center gap-2 self-start rounded-lg bg-teal-500 px-4 py-2
               text-sm font-medium text-white transition-colors
               hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
    >
        <IconPlus size={16} aria-hidden="true" />
        Nuevo seguro
    </button>
</div>

<!-- Search bar -->
<div class="mb-4">
    <InsuranceSearchBar
        value={insurances.search}
        disabled={insurances.loading}
        onsearch={(v) => insurances.setSearch(v)}
    />
</div>

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
    onEdit={openEdit}
    onDeactivate={openDeactivate}
    onActivate={openActivate}
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

<!-- Create / Edit modal -->
<InsuranceForm
    open={formOpen}
    mode={formMode}
    initial={editTarget}
    submitting={insurances.submitting}
    error={insurances.submitError}
    onsubmit={handleFormSubmit}
    oncancel={() => (formOpen = false)}
/>

<!-- Deactivate confirmation modal -->
<DeactivateConfirmModal
    open={confirmOpen}
    insuranceName={deactivateTarget?.name ?? ''}
    submitting={insurances.submitting}
    error={insurances.submitError}
    onconfirm={handleDeactivate}
    oncancel={() => (confirmOpen = false)}
/>

<!-- Activate confirmation modal -->
<ActivateConfirmModal
    open={activateOpen}
    insuranceName={activateTarget?.name ?? ''}
    submitting={insurances.submitting}
    error={insurances.submitError}
    onconfirm={handleActivate}
    oncancel={() => (activateOpen = false)}
/>
