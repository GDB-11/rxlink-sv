<!-- src/routes/(app)/configuracion/alergias/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { IconPlus } from '@tabler/icons-svelte';
    import { allergies } from '$lib/features/allergies';
    import type { AllergyResponse, AllergyRequestBody } from '$lib/api/allergyApi';
    import AllergySearchBar from '$lib/features/allergies/components/AllergySearchBar.svelte';
    import AllergyTable from '$lib/features/allergies/components/AllergyTable.svelte';
    import AllergyPagination from '$lib/features/allergies/components/AllergyPagination.svelte';
    import AllergyForm from '$lib/features/allergies/components/AllergyForm.svelte';
    import DeactivateConfirmModal from '$lib/features/allergies/components/DeactivateConfirmModal.svelte';
    import ActivateConfirmModal from '$lib/features/allergies/components/ActivateConfirmModal.svelte';

    let formOpen = $state(false);
    let formMode = $state<'create' | 'edit'>('create');
    let editTarget = $state<AllergyResponse | null>(null);

    let confirmOpen = $state(false);
    let deactivateTarget = $state<AllergyResponse | null>(null);

    let activateOpen = $state(false);
    let activateTarget = $state<AllergyResponse | null>(null);

    onMount(() => allergies.loadPage());

    function openCreate() {
        editTarget = null;
        formMode = 'create';
        allergies.clearSubmitError();
        formOpen = true;
    }

    function openEdit(item: AllergyResponse) {
        editTarget = item;
        formMode = 'edit';
        allergies.clearSubmitError();
        formOpen = true;
    }

    function openDeactivate(item: AllergyResponse) {
        deactivateTarget = item;
        allergies.clearSubmitError();
        confirmOpen = true;
    }

    function openActivate(item: AllergyResponse) {
        activateTarget = item;
        allergies.clearSubmitError();
        activateOpen = true;
    }

    async function handleFormSubmit(data: AllergyRequestBody) {
        const success =
            formMode === 'create'
                ? await allergies.create(data)
                : await allergies.update(editTarget!.allergyCode, data);
        if (success) formOpen = false;
    }

    async function handleDeactivate() {
        if (!deactivateTarget) return;
        const success = await allergies.deactivate(deactivateTarget.allergyCode);
        if (success) confirmOpen = false;
    }

    async function handleActivate() {
        if (!activateTarget) return;
        const success = await allergies.activate(activateTarget.allergyCode);
        if (success) activateOpen = false;
    }
</script>

<svelte:head>
    <title>Alergias — RxLink</title>
</svelte:head>

<!-- Page header -->
<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
        <h1
            class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
            style="font-family: 'Instrument Serif', serif;"
        >
            Alergias
        </h1>
        <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Gestión del catálogo de alergias
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
        Nueva alergia
    </button>
</div>

<!-- Search bar -->
<div class="mb-4">
    <AllergySearchBar
        value={allergies.search}
        disabled={allergies.loading}
        onsearch={(v) => allergies.setSearch(v)}
    />
</div>

<!-- Load error -->
{#if allergies.error}
    <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
               dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
        {allergies.error}
    </div>
{/if}

<!-- Allergy table -->
<AllergyTable
    items={allergies.items}
    loading={allergies.loading}
    onEdit={openEdit}
    onDeactivate={openDeactivate}
    onActivate={openActivate}
/>

<!-- Pagination -->
{#if allergies.totalCount > 0}
    <div class="mt-4">
        <AllergyPagination
            page={allergies.page}
            pageSize={allergies.pageSize}
            totalCount={allergies.totalCount}
            totalPages={allergies.totalPages}
            loading={allergies.loading}
            onPageChange={(p) => allergies.setPage(p)}
        />
    </div>
{/if}

<!-- Create / Edit modal -->
<AllergyForm
    open={formOpen}
    mode={formMode}
    initial={editTarget}
    submitting={allergies.submitting}
    error={allergies.submitError}
    onsubmit={handleFormSubmit}
    oncancel={() => (formOpen = false)}
/>

<!-- Deactivate confirmation modal -->
<DeactivateConfirmModal
    open={confirmOpen}
    allergyName={deactivateTarget?.name ?? ''}
    submitting={allergies.submitting}
    error={allergies.submitError}
    onconfirm={handleDeactivate}
    oncancel={() => (confirmOpen = false)}
/>

<!-- Activate confirmation modal -->
<ActivateConfirmModal
    open={activateOpen}
    allergyName={activateTarget?.name ?? ''}
    submitting={allergies.submitting}
    error={allergies.submitError}
    onconfirm={handleActivate}
    oncancel={() => (activateOpen = false)}
/>
