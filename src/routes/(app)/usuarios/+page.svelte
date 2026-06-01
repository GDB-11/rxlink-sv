<!-- src/routes/(app)/usuarios/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { IconPlus } from '@tabler/icons-svelte';
    import { users } from '$lib/features/users';
    import type { UserResponse, CreateUserBody, UpdateUserBody } from '$lib/api/userApi';
    import UserSearchBar from '$lib/features/users/components/UserSearchBar.svelte';
    import UserTable from '$lib/features/users/components/UserTable.svelte';
    import UserPagination from '$lib/features/users/components/UserPagination.svelte';
    import UserForm from '$lib/features/users/components/UserForm.svelte';
    import DeactivateUserModal from '$lib/features/users/components/DeactivateUserModal.svelte';
    import ActivateUserModal from '$lib/features/users/components/ActivateUserModal.svelte';

    let formOpen   = $state(false);
    let formMode   = $state<'create' | 'edit'>('create');
    let editTarget = $state<UserResponse | null>(null);

    let confirmOpen      = $state(false);
    let deactivateTarget = $state<UserResponse | null>(null);

    let activateOpen   = $state(false);
    let activateTarget = $state<UserResponse | null>(null);

    onMount(() => users.loadPage());

    function openCreate() {
        editTarget = null;
        formMode   = 'create';
        users.clearSubmitError();
        formOpen = true;
    }

    function openEdit(item: UserResponse) {
        editTarget = item;
        formMode   = 'edit';
        users.clearSubmitError();
        formOpen = true;
    }

    function openDeactivate(item: UserResponse) {
        deactivateTarget = item;
        users.clearSubmitError();
        confirmOpen = true;
    }

    function openActivate(item: UserResponse) {
        activateTarget = item;
        users.clearSubmitError();
        activateOpen = true;
    }

    async function handleFormSubmit(data: CreateUserBody | UpdateUserBody) {
        const success =
            formMode === 'create'
                ? await users.create(data as CreateUserBody)
                : await users.update(editTarget!.userCode, data as UpdateUserBody);
        if (success) formOpen = false;
    }

    async function handleDeactivate() {
        if (!deactivateTarget) return;
        const success = await users.deactivate(deactivateTarget.userCode);
        if (success) confirmOpen = false;
    }

    async function handleActivate() {
        if (!activateTarget) return;
        const success = await users.activate(activateTarget.userCode);
        if (success) activateOpen = false;
    }

    function fullName(u: UserResponse | null) {
        return u ? `${u.names} ${u.surnames}` : '';
    }
</script>

<svelte:head>
    <title>Usuarios — RxLink</title>
</svelte:head>

<!-- Page header -->
<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
        <h1
            class="text-2xl font-semibold text-stone-900 dark:text-stone-50"
            style="font-family: 'Instrument Serif', serif;"
        >
            Usuarios
        </h1>
        <p class="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Gestión de usuarios de la plataforma
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
        Nuevo usuario
    </button>
</div>

<!-- Search bar -->
<div class="mb-4">
    <UserSearchBar
        value={users.search}
        disabled={users.loading}
        onsearch={(v) => users.setSearch(v)}
    />
</div>

<!-- Load error -->
{#if users.error}
    <div class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
               dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
        {users.error}
    </div>
{/if}

<!-- User table -->
<UserTable
    items={users.items}
    loading={users.loading}
    onEdit={openEdit}
    onDeactivate={openDeactivate}
    onActivate={openActivate}
/>

<!-- Pagination -->
{#if users.totalCount > 0}
    <div class="mt-4">
        <UserPagination
            page={users.page}
            pageSize={users.pageSize}
            totalCount={users.totalCount}
            totalPages={users.totalPages}
            loading={users.loading}
            onPageChange={(p) => users.setPage(p)}
        />
    </div>
{/if}

<!-- Create / Edit modal -->
<UserForm
    open={formOpen}
    mode={formMode}
    initial={editTarget}
    lookups={users.lookups}
    submitting={users.submitting}
    error={users.submitError}
    onsubmit={handleFormSubmit}
    oncancel={() => (formOpen = false)}
/>

<!-- Deactivate confirmation modal -->
<DeactivateUserModal
    open={confirmOpen}
    userName={fullName(deactivateTarget)}
    submitting={users.submitting}
    error={users.submitError}
    onconfirm={handleDeactivate}
    oncancel={() => (confirmOpen = false)}
/>

<!-- Activate confirmation modal -->
<ActivateUserModal
    open={activateOpen}
    userName={fullName(activateTarget)}
    submitting={users.submitting}
    error={users.submitError}
    onconfirm={handleActivate}
    oncancel={() => (activateOpen = false)}
/>
