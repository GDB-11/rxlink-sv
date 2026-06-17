<!-- src/lib/features/doctor-consultations/components/ConsultationsPage.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { consultations } from '../stores/consultations.svelte';
    import AppointmentFilters from './AppointmentFilters.svelte';
    import AppointmentTable from './AppointmentTable.svelte';

    onMount(() => {
        consultations.reset();
        consultations.load();
    });

    const start     = $derived((consultations.page - 1) * consultations.pageSize + 1);
    const end       = $derived(Math.min(consultations.page * consultations.pageSize, consultations.total));
    const totalPages = $derived(consultations.totalPages);
</script>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-stone-900 dark:text-stone-50">Mis consultas</h1>
    </div>

    <div class="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
        <AppointmentFilters
            date={consultations.date}
            status={consultations.status}
            loading={consultations.loading}
            onchange={(d, s) => consultations.setFilters(d, s)}
        />
    </div>

    {#if consultations.error}
        <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                    dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
            {consultations.error}
        </div>
    {/if}

    <AppointmentTable items={consultations.items} loading={consultations.loading} />

    {#if consultations.total > 0}
        <div class="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
            <span>
                Mostrando {start}–{end} de {consultations.total} cita{consultations.total !== 1 ? 's' : ''}
            </span>
            <div class="flex gap-1">
                <button
                    type="button"
                    onclick={() => consultations.setPage(consultations.page - 1)}
                    disabled={consultations.page <= 1 || consultations.loading}
                    class="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-xs
                           transition-colors hover:bg-stone-50
                           disabled:cursor-not-allowed disabled:opacity-40
                           dark:border-stone-700 dark:hover:bg-stone-800"
                >
                    Anterior
                </button>
                <button
                    type="button"
                    onclick={() => consultations.setPage(consultations.page + 1)}
                    disabled={consultations.page >= totalPages || consultations.loading}
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
