<!-- src/lib/features/persons/components/PersonsPage.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { IconPlus } from '@tabler/icons-svelte';
    import { persons } from '$lib/features/persons';
    import type { PersonResponse, PersonRequestBody } from '$lib/api/personApi';
    import PersonSearchBar from './PersonSearchBar.svelte';
    import PersonTable from './PersonTable.svelte';
    import PersonPagination from './PersonPagination.svelte';
    import PersonForm from './PersonForm.svelte';

    interface Props {
        title: string;
        description: string;
    }
    let { title, description }: Props = $props();

    let formOpen   = $state(false);
    let formMode   = $state<'create' | 'edit'>('create');
    let editTarget = $state<PersonResponse | null>(null);

    onMount(() => persons.loadPage());

    function openCreate() {
        editTarget = null;
        formMode   = 'create';
        persons.clearSubmitError();
        formOpen = true;
    }

    function openEdit(item: PersonResponse) {
        editTarget = item;
        formMode   = 'edit';
        persons.clearSubmitError();
        formOpen = true;
    }

    async function handleFormSubmit(data: PersonRequestBody) {
        const success =
            formMode === 'create'
                ? await persons.create(data)
                : await persons.update(editTarget!.personCode, data);
        if (success) formOpen = false;
    }
</script>

<!-- Page header -->
<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
        <h1
            class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
            style="font-family: 'Instrument Serif', serif;"
        >
            {title}
        </h1>
        <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            {description}
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
        Nueva persona
    </button>
</div>

<!-- Search bar -->
<div class="mb-4">
    <PersonSearchBar
        value={persons.search}
        disabled={persons.loading}
        onsearch={(v) => persons.setSearch(v)}
    />
</div>

<!-- Load error -->
{#if persons.error}
    <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
               dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
        {persons.error}
    </div>
{/if}

<!-- Person table -->
<PersonTable
    items={persons.items}
    loading={persons.loading}
    onEdit={openEdit}
/>

<!-- Pagination -->
{#if persons.totalCount > 0}
    <div class="mt-4">
        <PersonPagination
            page={persons.page}
            pageSize={persons.pageSize}
            totalCount={persons.totalCount}
            totalPages={persons.totalPages}
            loading={persons.loading}
            onPageChange={(p) => persons.setPage(p)}
        />
    </div>
{/if}

<!-- Create / Edit modal -->
<PersonForm
    open={formOpen}
    mode={formMode}
    initial={editTarget}
    lookups={persons.lookups}
    submitting={persons.submitting}
    error={persons.submitError}
    onsubmit={handleFormSubmit}
    oncancel={() => (formOpen = false)}
/>
