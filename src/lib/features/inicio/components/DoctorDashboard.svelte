<!-- src/lib/features/inicio/components/DoctorDashboard.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { auth } from '$lib/features/auth';
    import { dashboard } from '../stores/dashboard.svelte';
    import DashboardGreeting from '$lib/components/ui/DashboardGreeting.svelte';
    import DashboardKpiCard from '$lib/components/ui/DashboardKpiCard.svelte';
    import DoctorAgendaRow from './DoctorAgendaRow.svelte';

    onMount(() => {
        dashboard.loadDoctor();
        return () => dashboard.reset();
    });

    const todayAppts      = $derived(dashboard.doctorAppointments);
    const confirmedCount  = $derived(todayAppts.filter(a => a.statusName === 'Confirmado').length);
    const completedCount  = $derived(todayAppts.filter(a => a.statusName === 'Completado').length);
    const draftCount      = $derived(dashboard.doctorDrafts.length);

    const sortedAppts = $derived(
        [...todayAppts].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    );
</script>

<div class="flex flex-col gap-8">
    <DashboardGreeting fullName={auth.user?.fullName ?? ''} />

    {#if dashboard.doctorError}
        <div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                    dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
            {dashboard.doctorError}
        </div>
    {/if}

    <!-- KPI cards -->
    <div class="grid grid-cols-3 gap-4">
        <DashboardKpiCard
            label="Confirmadas hoy"
            value={dashboard.doctorLoadingAppts ? '…' : confirmedCount}
            colorClass="bg-teal-50 dark:bg-teal-900/30"
        />
        <DashboardKpiCard
            label="Completadas hoy"
            value={dashboard.doctorLoadingAppts ? '…' : completedCount}
            colorClass="bg-sky-50 dark:bg-sky-900/30"
        />
        <DashboardKpiCard
            label="Recetas en borrador"
            value={dashboard.doctorLoadingDrafts ? '…' : draftCount}
            colorClass={draftCount > 0 ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-stone-100 dark:bg-stone-800/60'}
        />
    </div>

    <!-- Agenda de hoy -->
    <div class="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-stone-900">
        <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-stone-900 dark:text-stone-50">
                Agenda de hoy
            </h2>
            <a href="/consultas" class="text-sm text-teal-600 hover:underline dark:text-teal-400">
                Ver todas
            </a>
        </div>

        {#if dashboard.doctorLoadingAppts}
            <p class="text-sm text-stone-400">Cargando…</p>
        {:else if sortedAppts.length === 0}
            <p class="text-sm text-stone-400">No tienes citas programadas para hoy.</p>
        {:else}
            <div class="flex flex-col divide-y divide-stone-100 dark:divide-stone-800">
                {#each sortedAppts as appt (appt.appointmentCode)}
                    <DoctorAgendaRow {appt} />
                {/each}
            </div>
        {/if}
    </div>

    <!-- Draft prescriptions -->
    {#if draftCount > 0 || dashboard.doctorLoadingDrafts}
        <div class="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-stone-900">
            <h2 class="text-base font-semibold text-stone-900 dark:text-stone-50">
                Recetas pendientes de firma
            </h2>

            {#if dashboard.doctorLoadingDrafts}
                <p class="text-sm text-stone-400">Cargando…</p>
            {:else}
                <div class="flex flex-col divide-y divide-stone-100 dark:divide-stone-800">
                    {#each dashboard.doctorDrafts.slice(0, 3) as draft (draft.prescriptionCode)}
                        <div class="flex items-center justify-between gap-4 py-3">
                            <div class="flex flex-col gap-0.5">
                                <span class="text-sm font-medium text-stone-900 dark:text-stone-50">
                                    {draft.patientNames} {draft.patientSurnames}
                                </span>
                                <span class="text-xs text-stone-500 dark:text-stone-400">
                                    {draft.diagnosticDescription} · {draft.detailCount} medicamento{draft.detailCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <a
                                href="/pacientes/{draft.patientCode}/perfil"
                                class="shrink-0 rounded-lg border border-stone-200 px-3 py-1.5 text-xs
                                       font-medium text-stone-700 hover:bg-stone-50
                                       dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                            >
                                Ver receta
                            </a>
                        </div>
                    {/each}
                    {#if draftCount > 3}
                        <p class="pt-3 text-xs text-stone-400">
                            +{draftCount - 3} recetas más en borrador.
                        </p>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}

    <!-- Quick access -->
    <div class="flex gap-3">
        <a
            href="/consultas"
            class="rounded-xl bg-teal-600 px-5 py-3 text-sm font-medium text-white
                   hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
        >
            Mis consultas
        </a>
        <a
            href="/doctores/{auth.user?.userCode}/disponibilidad"
            class="rounded-xl border border-stone-200 px-5 py-3 text-sm font-medium
                   text-stone-700 hover:bg-stone-50 dark:border-stone-700
                   dark:text-stone-300 dark:hover:bg-stone-800"
        >
            Mi disponibilidad
        </a>
    </div>
</div>
