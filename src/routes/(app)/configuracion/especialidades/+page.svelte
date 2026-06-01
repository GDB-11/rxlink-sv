<!-- src/routes/(app)/configuracion/especialidades/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { IconPlus } from '@tabler/icons-svelte';
    import { specialties } from '$lib/features/specialties';
    import type { SpecialtyResponse, SpecialtyRequestBody } from '$lib/api/specialtyApi';
    import SpecialtySearchBar from '$lib/features/specialties/components/SpecialtySearchBar.svelte';
    import SpecialtyTable from '$lib/features/specialties/components/SpecialtyTable.svelte';
    import SpecialtyPagination from '$lib/features/specialties/components/SpecialtyPagination.svelte';
    import SpecialtyForm from '$lib/features/specialties/components/SpecialtyForm.svelte';
    import DeactivateConfirmModal from '$lib/features/specialties/components/DeactivateConfirmModal.svelte';
    import ActivateConfirmModal from '$lib/features/specialties/components/ActivateConfirmModal.svelte';

    let formOpen = $state(false);
    let formMode = $state<'create' | 'edit'>('create');
    let editTarget = $state<SpecialtyResponse | null>(null);

    let confirmOpen = $state(false);
    let deactivateTarget = $state<SpecialtyResponse | null>(null);

    let activateOpen = $state(false);
    let activateTarget = $state<SpecialtyResponse | null>(null);

    onMount(() => specialties.loadPage());

    function openCreate() {
        editTarget = null;
        formMode = 'create';
        specialties.clearSubmitError();
        formOpen = true;
    }

    function openEdit(item: SpecialtyResponse) {
        editTarget = item;
        formMode = 'edit';
        specialties.clearSubmitError();
        formOpen = true;
    }

    function openDeactivate(item: SpecialtyResponse) {
        deactivateTarget = item;
        specialties.clearSubmitError();
        confirmOpen = true;
    }

    function openActivate(item: SpecialtyResponse) {
        activateTarget = item;
        specialties.clearSubmitError();
        activateOpen = true;
    }

    async function handleFormSubmit(data: SpecialtyRequestBody) {
        const success =
            formMode === 'create'
                ? await specialties.create(data)
                : await specialties.update(editTarget!.specialtyCode, data);
        if (success) formOpen = false;
    }

    async function handleDeactivate() {
        if (!deactivateTarget) return;
        const success = await specialties.deactivate(deactivateTarget.specialtyCode);
        if (success) confirmOpen = false;
    }

    async function handleActivate() {
        if (!activateTarget) return;
        const success = await specialties.activate(activateTarget.specialtyCode);
        if (success) activateOpen = false;
    }
</script>

<svelte:head>
    <title>Especialidades — RxLink</title>
</svelte:head>

<!-- Page header -->
<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
        <h1
            class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
            style="font-family: 'Instrument Serif', serif;"
        >
            Especialidades
        </h1>
        <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Gestión del catálogo de especialidades
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
        Nueva especialidad
    </button>
</div>

<!-- Search bar -->
<div class="mb-4">
    <SpecialtySearchBar
        value={specialties.search}
        disabled={specialties.loading}
        onsearch={(v) => specialties.setSearch(v)}
    />
</div>

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
    onEdit={openEdit}
    onDeactivate={openDeactivate}
    onActivate={openActivate}
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

<!-- Create / Edit modal -->
<SpecialtyForm
    open={formOpen}
    mode={formMode}
    initial={editTarget}
    submitting={specialties.submitting}
    error={specialties.submitError}
    onsubmit={handleFormSubmit}
    oncancel={() => (formOpen = false)}
/>

<!-- Deactivate confirmation modal -->
<DeactivateConfirmModal
    open={confirmOpen}
    specialtyName={deactivateTarget?.name ?? ''}
    submitting={specialties.submitting}
    error={specialties.submitError}
    onconfirm={handleDeactivate}
    oncancel={() => (confirmOpen = false)}
/>

<!-- Activate confirmation modal -->
<ActivateConfirmModal
    open={activateOpen}
    specialtyName={activateTarget?.name ?? ''}
    submitting={specialties.submitting}
    error={specialties.submitError}
    onconfirm={handleActivate}
    oncancel={() => (activateOpen = false)}
/>
