<!-- src/lib/features/inicio/components/NurseDashboard.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { auth } from '$lib/features/auth';
    import { nurse } from '$lib/features/nurse';
    import { dashboard } from '../stores/dashboard.svelte';
    import DashboardGreeting from '$lib/components/ui/DashboardGreeting.svelte';
    import DashboardKpiCard from '$lib/components/ui/DashboardKpiCard.svelte';
    import NursePatientSearchBar from '$lib/features/nurse/components/NursePatientSearchBar.svelte';
    import NursePatientResults from '$lib/features/nurse/components/NursePatientResults.svelte';
    import NurseDispensationRow from './NurseDispensationRow.svelte';

    onMount(() => {
        dashboard.loadNurse();
        return () => {
            nurse.reset();
            dashboard.reset();
        };
    });
</script>

<div class="flex flex-col gap-8">
    <DashboardGreeting
        fullName={auth.user?.fullName ?? ''}
        subtitle="Busca un paciente para gestionar sus recetas"
    />

    <!-- KPI -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardKpiCard
            label="Dispensaciones hoy"
            value={dashboard.nurseLoading ? '…' : dashboard.dispensations.length}
            colorClass="bg-teal-50 dark:bg-teal-900/30"
        />
    </div>

    <!-- Patient search -->
    <div class="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-stone-900">
        <h2 class="text-base font-semibold text-stone-900 dark:text-stone-50">
            Buscar paciente
        </h2>

        <NursePatientSearchBar
            value={nurse.search}
            onsearch={(q) => nurse.searchPatients(q)}
        />

        {#if nurse.error}
            <div class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                        dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                {nurse.error}
            </div>
        {/if}

        <NursePatientResults
            items={nurse.results}
            loading={nurse.loading}
            search={nurse.search}
            totalCount={nurse.totalCount}
            page={nurse.page}
            totalPages={nurse.totalPages}
            onpage={(p) => nurse.setPage(p)}
        />
    </div>

    <!-- Today's dispensations -->
    <div class="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-stone-900">
        <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-stone-900 dark:text-stone-50">
                Dispensaciones del día
            </h2>
            <a href="/enfermero/pacientes" class="text-sm text-teal-600 hover:underline dark:text-teal-400">
                Ir a pacientes
            </a>
        </div>

        {#if dashboard.nurseLoading}
            <p class="text-sm text-stone-400">Cargando…</p>
        {:else if dashboard.nurseError}
            <p class="text-sm text-rose-500">{dashboard.nurseError}</p>
        {:else if dashboard.dispensations.length === 0}
            <p class="text-sm text-stone-400">No has dispensado recetas hoy todavía.</p>
        {:else}
            <div class="flex flex-col divide-y divide-stone-100 dark:divide-stone-800">
                {#each dashboard.dispensations as d (d.prescriptionCode)}
                    <NurseDispensationRow dispensation={d} />
                {/each}
            </div>
        {/if}
    </div>
</div>
