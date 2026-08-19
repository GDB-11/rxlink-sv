<!-- src/lib/features/inicio/components/AdminDashboard.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { auth } from '$lib/features/auth';
    import { dashboard } from '../stores/dashboard.svelte';
    import DashboardGreeting from '$lib/components/ui/DashboardGreeting.svelte';
    import DashboardKpiCard from '$lib/components/ui/DashboardKpiCard.svelte';
    import AdminAppointmentStatusBadge from '$lib/features/admin-appointments/components/AdminAppointmentStatusBadge.svelte';
    import ConfirmPaymentModal from '$lib/features/admin-appointments/components/ConfirmPaymentModal.svelte';

    let confirmPaymentTarget = $state<string | null>(null);

    onMount(() => {
        dashboard.loadAdmin();
        return () => dashboard.reset();
    });

    const allAppts     = $derived(dashboard.adminAppointments);
    const todayAppts   = $derived(allAppts.filter(a => {
        const d = new Date(a.scheduledAt);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    }));

    const totalToday        = $derived(todayAppts.length);
    const confirmedToday    = $derived(todayAppts.filter(a => a.statusName === 'Confirmado').length);
    const pendingPayment    = $derived(todayAppts.filter(a => a.statusName === 'PendientePago').length);
    const completedToday    = $derived(todayAppts.filter(a => a.statusName === 'Completado').length);

    const pendingPaymentList = $derived(
        allAppts.filter(a => a.statusName === 'PendientePago').slice(0, 5)
    );

    const upcomingConfirmed = $derived(
        allAppts
            .filter(a => a.statusName === 'Confirmado')
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
            .slice(0, 5)
    );

    function formatTime(iso: string) {
        return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    }

    function formatDate(iso: string) {
        const d = new Date(iso);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return 'Hoy';
        return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    }

    async function handlePaymentConfirmed() {
        confirmPaymentTarget = null;
        await dashboard.loadAdmin();
    }
</script>

<ConfirmPaymentModal
    open={confirmPaymentTarget !== null}
    appointmentCode={confirmPaymentTarget ?? ''}
    onConfirmed={handlePaymentConfirmed}
    oncancel={() => (confirmPaymentTarget = null)}
/>

<div class="flex flex-col gap-8">
    <DashboardGreeting fullName={auth.user?.fullName ?? ''} />

    {#if dashboard.adminError}
        <div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700
                    dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
            {dashboard.adminError}
        </div>
    {/if}

    <!-- KPI cards -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardKpiCard
            label="Citas hoy"
            value={dashboard.adminLoadingAppts ? '…' : totalToday}
            colorClass="bg-stone-100 dark:bg-stone-800/60"
        />
        <DashboardKpiCard
            label="Confirmadas"
            value={dashboard.adminLoadingAppts ? '…' : confirmedToday}
            colorClass="bg-teal-50 dark:bg-teal-900/30"
        />
        <DashboardKpiCard
            label="Pendientes de pago"
            value={dashboard.adminLoadingAppts ? '…' : pendingPayment}
            colorClass="bg-amber-50 dark:bg-amber-900/30"
        />
        <DashboardKpiCard
            label="Completadas"
            value={dashboard.adminLoadingAppts ? '…' : completedToday}
            colorClass="bg-sky-50 dark:bg-sky-900/30"
        />
    </div>

    <!-- Pending payment -->
    <div class="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-stone-900">
        <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-stone-900 dark:text-stone-50">
                Pendientes de pago
            </h2>
            <a href="/citas" class="text-sm text-teal-600 hover:underline dark:text-teal-400">
                Ver todas
            </a>
        </div>

        {#if dashboard.adminLoadingAppts}
            <p class="text-sm text-stone-400">Cargando…</p>
        {:else if pendingPaymentList.length === 0}
            <p class="text-sm text-stone-400">No hay citas pendientes de pago.</p>
        {:else}
            <div class="flex flex-col divide-y divide-stone-100 dark:divide-stone-800">
                {#each pendingPaymentList as appt (appt.appointmentCode)}
                    <div class="flex items-center justify-between gap-4 py-3">
                        <div class="flex flex-col gap-0.5">
                            <span class="text-sm font-medium text-stone-900 dark:text-stone-50">
                                {appt.patientNames} {appt.patientSurnames}
                            </span>
                            <span class="text-xs text-stone-500 dark:text-stone-400">
                                {appt.doctorNames} {appt.doctorSurnames} · {appt.specialtyName} · {formatTime(appt.scheduledAt)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onclick={() => (confirmPaymentTarget = appt.appointmentCode)}
                            class="shrink-0 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium
                                   text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
                        >
                            Confirmar pago
                        </button>
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Upcoming confirmed -->
    <div class="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-stone-900">
        <h2 class="text-base font-semibold text-stone-900 dark:text-stone-50">
            Próximas citas confirmadas
        </h2>

        {#if dashboard.adminLoadingAppts}
            <p class="text-sm text-stone-400">Cargando…</p>
        {:else if upcomingConfirmed.length === 0}
            <p class="text-sm text-stone-400">No hay citas confirmadas próximas.</p>
        {:else}
            <div class="flex flex-col divide-y divide-stone-100 dark:divide-stone-800">
                {#each upcomingConfirmed as appt (appt.appointmentCode)}
                    <div class="flex items-center gap-4 py-3">
                        <div class="flex w-20 shrink-0 flex-col items-center rounded-xl
                                    bg-stone-100 py-2 dark:bg-stone-800">
                            <span class="text-xs text-stone-500 dark:text-stone-400">
                                {formatDate(appt.scheduledAt)}
                            </span>
                            <span class="text-lg font-semibold text-stone-900 dark:text-stone-50">
                                {formatTime(appt.scheduledAt)}
                            </span>
                        </div>
                        <div class="flex flex-col gap-0.5">
                            <span class="text-sm font-medium text-stone-900 dark:text-stone-50">
                                {appt.patientNames} {appt.patientSurnames}
                            </span>
                            <span class="text-xs text-stone-500 dark:text-stone-400">
                                {appt.doctorNames} {appt.doctorSurnames} · {appt.specialtyName}
                            </span>
                        </div>
                        <div class="ml-auto">
                            <AdminAppointmentStatusBadge statusName={appt.statusName} />
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
