<!-- src/routes/(app)/configuracion/medicamentos/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { IconPlus } from '@tabler/icons-svelte';
    import { medications } from '$lib/features/medications';
    import type { MedicationResponse, MedicationRequestBody } from '$lib/api/medicationsApi';
    import MedicationSearchBar from '$lib/features/medications/components/MedicationSearchBar.svelte';
    import MedicationTable from '$lib/features/medications/components/MedicationTable.svelte';
    import MedicationPagination from '$lib/features/medications/components/MedicationPagination.svelte';
    import MedicationForm from '$lib/features/medications/components/MedicationForm.svelte';
    import DeactivateConfirmModal from '$lib/features/medications/components/DeactivateConfirmModal.svelte';
    import ActivateConfirmModal from '$lib/features/medications/components/ActivateConfirmModal.svelte';

    let formOpen = $state(false);
    let formMode = $state<'create' | 'edit'>('create');
    let editTarget = $state<MedicationResponse | null>(null);

    let confirmOpen = $state(false);
    let deactivateTarget = $state<MedicationResponse | null>(null);

    let activateOpen = $state(false);
    let activateTarget = $state<MedicationResponse | null>(null);

    onMount(() => medications.loadPage());

    function openCreate() {
        editTarget = null;
        formMode = 'create';
        medications.clearSubmitError();
        formOpen = true;
    }

    function openEdit(item: MedicationResponse) {
        editTarget = item;
        formMode = 'edit';
        medications.clearSubmitError();
        formOpen = true;
    }

    function openDeactivate(item: MedicationResponse) {
        deactivateTarget = item;
        medications.clearSubmitError();
        confirmOpen = true;
    }

    function openActivate(item: MedicationResponse) {
        activateTarget = item;
        medications.clearSubmitError();
        activateOpen = true;
    }

    async function handleFormSubmit(data: MedicationRequestBody) {
        const success =
            formMode === 'create'
                ? await medications.create(data)
                : await medications.update(editTarget!.medicationCode, data);
        if (success) formOpen = false;
    }

    async function handleDeactivate() {
        if (!deactivateTarget) return;
        const success = await medications.deactivate(deactivateTarget.medicationCode);
        if (success) confirmOpen = false;
    }

    async function handleActivate() {
        if (!activateTarget) return;
        const success = await medications.activate(activateTarget.medicationCode);
        if (success) activateOpen = false;
    }
</script>

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
            Gestión del catálogo de medicamentos
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
        Nuevo medicamento
    </button>
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

<!-- Medication table -->
<MedicationTable
    items={medications.items}
    loading={medications.loading}
    onEdit={openEdit}
    onDeactivate={openDeactivate}
    onActivate={openActivate}
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

<!-- Create / Edit modal -->
<MedicationForm
    open={formOpen}
    mode={formMode}
    initial={editTarget}
    knownForms={medications.knownForms}
    knownRoutes={medications.knownRoutes}
    submitting={medications.submitting}
    error={medications.submitError}
    onsubmit={handleFormSubmit}
    oncancel={() => (formOpen = false)}
/>

<!-- Deactivate confirmation modal -->
<DeactivateConfirmModal
    open={confirmOpen}
    medicationName={deactivateTarget?.genericName ?? ''}
    submitting={medications.submitting}
    error={medications.submitError}
    onconfirm={handleDeactivate}
    oncancel={() => (confirmOpen = false)}
/>

<!-- Activate confirmation modal -->
<ActivateConfirmModal
    open={activateOpen}
    medicationName={activateTarget?.genericName ?? ''}
    submitting={medications.submitting}
    error={medications.submitError}
    onconfirm={handleActivate}
    oncancel={() => (activateOpen = false)}
/>
