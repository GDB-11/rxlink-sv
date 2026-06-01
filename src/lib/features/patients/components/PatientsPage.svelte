<!-- src/lib/features/patients/components/PatientsPage.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { IconPlus } from '@tabler/icons-svelte';
    import { patients } from '$lib/features/patients';
    import type { PatientResponse, CreatePatientBody, UpdatePatientBody } from '$lib/api/patientApi';
    import PatientSearchBar from './PatientSearchBar.svelte';
    import PatientTable from './PatientTable.svelte';
    import PatientPagination from './PatientPagination.svelte';
    import PatientForm from './PatientForm.svelte';
    import DeactivatePatientModal from './DeactivatePatientModal.svelte';
    import ActivatePatientModal from './ActivatePatientModal.svelte';

    let formOpen   = $state(false);
    let formMode   = $state<'create' | 'edit'>('create');
    let editTarget = $state<PatientResponse | null>(null);

    let confirmOpen      = $state(false);
    let deactivateTarget = $state<PatientResponse | null>(null);

    let activateOpen   = $state(false);
    let activateTarget = $state<PatientResponse | null>(null);

    onMount(() => patients.loadPage());

    function openCreate() {
        editTarget = null;
        formMode   = 'create';
        patients.clearSubmitError();
        formOpen = true;
    }

    function openEdit(item: PatientResponse) {
        editTarget = item;
        formMode   = 'edit';
        patients.clearSubmitError();
        formOpen = true;
    }

    function openDeactivate(item: PatientResponse) {
        deactivateTarget = item;
        patients.clearSubmitError();
        confirmOpen = true;
    }

    function openActivate(item: PatientResponse) {
        activateTarget = item;
        patients.clearSubmitError();
        activateOpen = true;
    }

    async function handleFormSubmit(data: CreatePatientBody | UpdatePatientBody) {
        const success =
            formMode === 'create'
                ? await patients.create(data as CreatePatientBody)
                : await patients.update(editTarget!.patientCode, data as UpdatePatientBody);
        if (success) formOpen = false;
    }

    async function handleDeactivate() {
        if (!deactivateTarget) return;
        const success = await patients.deactivate(deactivateTarget.patientCode);
        if (success) confirmOpen = false;
    }

    async function handleActivate() {
        if (!activateTarget) return;
        const success = await patients.activate(activateTarget.patientCode);
        if (success) activateOpen = false;
    }

    function fullName(p: PatientResponse | null) {
        return p ? `${p.names} ${p.surnames}` : '';
    }
</script>

<!-- Page header -->
<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
        <h1
            class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
            style="font-family: 'Instrument Serif', serif;"
        >
            Pacientes
        </h1>
        <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Gestión de pacientes
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
        Nuevo paciente
    </button>
</div>

<!-- Search bar -->
<div class="mb-4">
    <PatientSearchBar
        value={patients.search}
        disabled={patients.loading}
        onsearch={(v) => patients.setSearch(v)}
    />
</div>

<!-- Load error -->
{#if patients.error}
    <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
               dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
        {patients.error}
    </div>
{/if}

<!-- Patient table -->
<PatientTable
    items={patients.items}
    loading={patients.loading}
    onEdit={openEdit}
    onDeactivate={openDeactivate}
    onActivate={openActivate}
/>

<!-- Pagination -->
{#if patients.totalCount > 0}
    <div class="mt-4">
        <PatientPagination
            page={patients.page}
            pageSize={patients.pageSize}
            totalCount={patients.totalCount}
            totalPages={patients.totalPages}
            loading={patients.loading}
            onPageChange={(p) => patients.setPage(p)}
        />
    </div>
{/if}

<!-- Create / Edit modal -->
<PatientForm
    open={formOpen}
    mode={formMode}
    initial={editTarget}
    submitting={patients.submitting}
    error={patients.submitError}
    onsubmit={handleFormSubmit}
    oncancel={() => (formOpen = false)}
/>

<!-- Deactivate confirmation modal -->
<DeactivatePatientModal
    open={confirmOpen}
    patientName={fullName(deactivateTarget)}
    submitting={patients.submitting}
    error={patients.submitError}
    onconfirm={handleDeactivate}
    oncancel={() => (confirmOpen = false)}
/>

<!-- Activate confirmation modal -->
<ActivatePatientModal
    open={activateOpen}
    patientName={fullName(activateTarget)}
    submitting={patients.submitting}
    error={patients.submitError}
    onconfirm={handleActivate}
    oncancel={() => (activateOpen = false)}
/>
