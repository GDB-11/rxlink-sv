<!-- src/lib/features/admin-appointments/components/AdminAppointmentsPage.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { adminAppointments } from '../stores/adminAppointments.svelte';
    import AdminAppointmentFilters from './AdminAppointmentFilters.svelte';
    import AdminAppointmentTable from './AdminAppointmentTable.svelte';

    onMount(() => {
        adminAppointments.reset();
        adminAppointments.load();
    });

    const start      = $derived((adminAppointments.page - 1) * adminAppointments.pageSize + 1);
    const end        = $derived(Math.min(adminAppointments.page * adminAppointments.pageSize, adminAppointments.total));
    const totalPages = $derived(adminAppointments.totalPages);
</script>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-stone-900 dark:text-stone-50">Citas</h1>
        <a
            href="/citas/nueva"
            class="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium
                   text-white transition-colors hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
            + Nueva cita
        </a>
    </div>

    <AdminAppointmentFilters
        patientSearch={adminAppointments.patientSearch}
        date={adminAppointments.date}
        statusName={adminAppointments.statusName}
        loading={adminAppointments.loading}
        onchange={(s, d, st) => adminAppointments.setFilters(s, d, st)}
    />

    {#if adminAppointments.error}
        <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                    dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
            {adminAppointments.error}
        </div>
    {/if}

    <AdminAppointmentTable
        appointments={adminAppointments.items}
        loading={adminAppointments.loading}
        onToggled={() => adminAppointments.load()}
    />

    {#if adminAppointments.total > 0}
        <div class="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
            <span>
                Mostrando {start}–{end} de {adminAppointments.total} cita{adminAppointments.total !== 1 ? 's' : ''}
            </span>
            <div class="flex gap-1">
                <button
                    type="button"
                    onclick={() => adminAppointments.setPage(adminAppointments.page - 1)}
                    disabled={adminAppointments.page <= 1 || adminAppointments.loading}
                    class="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs
                           transition-colors hover:bg-stone-50
                           disabled:cursor-not-allowed disabled:opacity-40
                           dark:border-stone-700 dark:hover:bg-stone-800"
                >
                    Anterior
                </button>
                <button
                    type="button"
                    onclick={() => adminAppointments.setPage(adminAppointments.page + 1)}
                    disabled={adminAppointments.page >= totalPages || adminAppointments.loading}
                    class="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs
                           transition-colors hover:bg-stone-50
                           disabled:cursor-not-allowed disabled:opacity-40
                           dark:border-stone-700 dark:hover:bg-stone-800"
                >
                    Siguiente
                </button>
            </div>
        </div>
    {/if}
</div>
